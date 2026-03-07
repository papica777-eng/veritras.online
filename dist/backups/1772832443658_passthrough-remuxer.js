"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mp4_remuxer_1 = require("./mp4-remuxer");
const fragment_1 = require("../loader/fragment");
const codecs_1 = require("../utils/codecs");
const logger_1 = require("../utils/logger");
const mp4_tools_1 = require("../utils/mp4-tools");
const mp4_tools_2 = require("../utils/mp4-tools");
class PassThroughRemuxer extends logger_1.Logger {
    emitInitSegment = false;
    audioCodec;
    videoCodec;
    initData;
    initPTS = null;
    initTracks;
    lastEndTime = null;
    isVideoContiguous = false;
    constructor(observer, config, typeSupported, logger) {
        super('passthrough-remuxer', logger);
    }
    destroy() { }
    resetTimeStamp(defaultInitPTS) {
        this.lastEndTime = null;
        const initPTS = this.initPTS;
        if (initPTS && defaultInitPTS) {
            if (initPTS.baseTime === defaultInitPTS.baseTime &&
                initPTS.timescale === defaultInitPTS.timescale) {
                return;
            }
        }
        this.initPTS = defaultInitPTS;
    }
    resetNextTimestamp() {
        this.isVideoContiguous = false;
        this.lastEndTime = null;
    }
    resetInitSegment(initSegment, audioCodec, videoCodec, decryptdata) {
        this.audioCodec = audioCodec;
        this.videoCodec = videoCodec;
        this.generateInitSegment(initSegment, decryptdata);
        this.emitInitSegment = true;
    }
    generateInitSegment(initSegment, decryptdata) {
        let { audioCodec, videoCodec } = this;
        if (!initSegment?.byteLength) {
            this.initTracks = undefined;
            this.initData = undefined;
            return;
        }
        const { audio, video } = (this.initData = (0, mp4_tools_2.parseInitSegment)(initSegment));
        if (decryptdata) {
            (0, mp4_tools_1.patchEncyptionData)(initSegment, decryptdata);
        }
        else {
            const eitherTrack = audio || video;
            if (eitherTrack?.encrypted) {
                this.warn(`Init segment with encrypted track with has no key ("${eitherTrack.codec}")!`);
            }
        }
        // Get codec from initSegment
        if (audio) {
            audioCodec = getParsedTrackCodec(audio, fragment_1.ElementaryStreamTypes.AUDIO, this);
        }
        if (video) {
            videoCodec = getParsedTrackCodec(video, fragment_1.ElementaryStreamTypes.VIDEO, this);
        }
        const tracks = {};
        if (audio && video) {
            tracks.audiovideo = {
                container: 'video/mp4',
                codec: audioCodec + ',' + videoCodec,
                supplemental: video.supplemental,
                encrypted: video.encrypted,
                initSegment,
                id: 'main',
            };
        }
        else if (audio) {
            tracks.audio = {
                container: 'audio/mp4',
                codec: audioCodec,
                encrypted: audio.encrypted,
                initSegment,
                id: 'audio',
            };
        }
        else if (video) {
            tracks.video = {
                container: 'video/mp4',
                codec: videoCodec,
                supplemental: video.supplemental,
                encrypted: video.encrypted,
                initSegment,
                id: 'main',
            };
        }
        else {
            this.warn('initSegment does not contain moov or trak boxes.');
        }
        this.initTracks = tracks;
    }
    remux(audioTrack, videoTrack, id3Track, textTrack, timeOffset, accurateTimeOffset) {
        let { initPTS, lastEndTime } = this;
        const result = {
            audio: undefined,
            video: undefined,
            text: textTrack,
            id3: id3Track,
            initSegment: undefined,
        };
        // If we haven't yet set a lastEndDTS, or it was reset, set it to the provided timeOffset. We want to use the
        // lastEndDTS over timeOffset whenever possible; during progressive playback, the media source will not update
        // the media duration (which is what timeOffset is provided as) before we need to process the next chunk.
        if (!Number.isFinite(lastEndTime)) {
            lastEndTime = this.lastEndTime = timeOffset || 0;
        }
        // The binary segment data is added to the videoTrack in the mp4demuxer. We don't check to see if the data is only
        // audio or video (or both); adding it to video was an arbitrary choice.
        const data = videoTrack.samples;
        if (!data.length) {
            return result;
        }
        const initSegment = {
            initPTS: undefined,
            timescale: undefined,
            trackId: undefined,
        };
        let initData = this.initData;
        if (!initData?.length) {
            this.generateInitSegment(data);
            initData = this.initData;
        }
        if (!initData?.length) {
            // We can't remux if the initSegment could not be generated
            this.warn('Failed to generate initSegment.');
            return result;
        }
        if (this.emitInitSegment) {
            initSegment.tracks = this.initTracks;
            this.emitInitSegment = false;
        }
        const trackSampleData = (0, mp4_tools_2.getSampleData)(data, initData, this);
        const audioSampleTimestamps = initData.audio
            ? trackSampleData[initData.audio.id]
            : null;
        const videoSampleTimestamps = initData.video
            ? trackSampleData[initData.video.id]
            : null;
        const videoStartTime = toStartEndOrDefault(videoSampleTimestamps, Infinity);
        const audioStartTime = toStartEndOrDefault(audioSampleTimestamps, Infinity);
        const videoEndTime = toStartEndOrDefault(videoSampleTimestamps, 0, true);
        const audioEndTime = toStartEndOrDefault(audioSampleTimestamps, 0, true);
        let decodeTime = timeOffset;
        let duration = 0;
        const syncOnAudio = audioSampleTimestamps &&
            (!videoSampleTimestamps ||
                (!initPTS && audioStartTime < videoStartTime) ||
                (initPTS && initPTS.trackId === initData.audio.id));
        const baseOffsetSamples = syncOnAudio
            ? audioSampleTimestamps
            : videoSampleTimestamps;
        if (baseOffsetSamples) {
            const timescale = baseOffsetSamples.timescale;
            const baseTime = baseOffsetSamples.start - timeOffset * timescale;
            const trackId = syncOnAudio ? initData.audio.id : initData.video.id;
            decodeTime = baseOffsetSamples.start / timescale;
            duration = syncOnAudio
                ? audioEndTime - audioStartTime
                : videoEndTime - videoStartTime;
            if ((accurateTimeOffset || !initPTS) &&
                (isInvalidInitPts(initPTS, decodeTime, timeOffset, duration) ||
                    timescale !== initPTS.timescale)) {
                if (initPTS) {
                    this.warn(`Timestamps at playlist time: ${accurateTimeOffset ? '' : '~'}${timeOffset} ${baseTime / timescale} != initPTS: ${initPTS.baseTime / initPTS.timescale} (${initPTS.baseTime}/${initPTS.timescale}) trackId: ${initPTS.trackId}`);
                }
                this.log(`Found initPTS at playlist time: ${timeOffset} offset: ${decodeTime - timeOffset} (${baseTime}/${timescale}) trackId: ${trackId}`);
                initPTS = null;
                initSegment.initPTS = baseTime;
                initSegment.timescale = timescale;
                initSegment.trackId = trackId;
            }
        }
        else {
            this.warn(`No audio or video samples found for initPTS at playlist time: ${timeOffset}`);
        }
        if (!initPTS) {
            if (!initSegment.timescale ||
                initSegment.trackId === undefined ||
                initSegment.initPTS === undefined) {
                this.warn('Could not set initPTS');
                initSegment.initPTS = decodeTime;
                initSegment.timescale = 1;
                initSegment.trackId = -1;
            }
            this.initPTS = initPTS = {
                baseTime: initSegment.initPTS,
                timescale: initSegment.timescale,
                trackId: initSegment.trackId,
            };
        }
        else {
            initSegment.initPTS = initPTS.baseTime;
            initSegment.timescale = initPTS.timescale;
            initSegment.trackId = initPTS.trackId;
        }
        const startTime = decodeTime - initPTS.baseTime / initPTS.timescale;
        const endTime = startTime + duration;
        if (duration > 0) {
            this.lastEndTime = endTime;
        }
        else {
            this.warn('Duration parsed from mp4 should be greater than zero');
            this.resetNextTimestamp();
        }
        const hasAudio = !!initData.audio;
        const hasVideo = !!initData.video;
        let type = '';
        if (hasAudio) {
            type += 'audio';
        }
        if (hasVideo) {
            type += 'video';
        }
        const encrypted = (initData.audio ? initData.audio.encrypted : false) ||
            (initData.video ? initData.video.encrypted : false);
        const track = {
            data1: data,
            startPTS: startTime,
            startDTS: startTime,
            endPTS: endTime,
            endDTS: endTime,
            type,
            hasAudio,
            hasVideo,
            nb: 1,
            dropped: 0,
            encrypted,
        };
        result.audio = hasAudio && !hasVideo ? track : undefined;
        result.video = hasVideo ? track : undefined;
        const videoSampleCount = videoSampleTimestamps?.sampleCount;
        if (videoSampleCount) {
            const firstKeyFrame = videoSampleTimestamps.keyFrameIndex;
            const independent = firstKeyFrame !== -1;
            track.nb = videoSampleCount;
            track.dropped =
                firstKeyFrame === 0 || this.isVideoContiguous
                    ? 0
                    : independent
                        ? firstKeyFrame
                        : videoSampleCount;
            track.independent = independent;
            track.firstKeyFrame = firstKeyFrame;
            if (independent && videoSampleTimestamps.keyFrameStart) {
                track.firstKeyFramePTS =
                    (videoSampleTimestamps.keyFrameStart - initPTS.baseTime) /
                        initPTS.timescale;
            }
            if (!this.isVideoContiguous) {
                result.independent = independent;
            }
            this.isVideoContiguous ||= independent;
            if (track.dropped) {
                this.warn(`fmp4 does not start with IDR: firstIDR ${firstKeyFrame}/${videoSampleCount} dropped: ${track.dropped} start: ${track.firstKeyFramePTS || 'NA'}`);
            }
        }
        result.initSegment = initSegment;
        result.id3 = (0, mp4_remuxer_1.flushTextTrackMetadataCueSamples)(id3Track, timeOffset, initPTS, initPTS);
        if (textTrack.samples.length) {
            result.text = (0, mp4_remuxer_1.flushTextTrackUserdataCueSamples)(textTrack, timeOffset, initPTS);
        }
        return result;
    }
}
function toStartEndOrDefault(trackTimes, defaultValue, end = false) {
    return trackTimes?.start !== undefined
        ? (trackTimes.start + (end ? trackTimes.duration : 0)) /
            trackTimes.timescale
        : defaultValue;
}
function isInvalidInitPts(initPTS, startDTS, timeOffset, duration) {
    if (initPTS === null) {
        return true;
    }
    // InitPTS is invalid when distance from program would be more than segment duration or a minimum of one second
    const minDuration = Math.max(duration, 1);
    const startTime = startDTS - initPTS.baseTime / initPTS.timescale;
    return Math.abs(startTime - timeOffset) > minDuration;
}
function getParsedTrackCodec(track, type, logger) {
    const parsedCodec = track.codec;
    if (parsedCodec && parsedCodec.length > 4) {
        return parsedCodec;
    }
    if (type === fragment_1.ElementaryStreamTypes.AUDIO) {
        if (parsedCodec === 'ec-3' ||
            parsedCodec === 'ac-3' ||
            parsedCodec === 'alac') {
            return parsedCodec;
        }
        if (parsedCodec === 'fLaC' || parsedCodec === 'Opus') {
            // Opting not to get `preferManagedMediaSource` from player config for isSupported() check for simplicity
            const preferManagedMediaSource = false;
            return (0, codecs_1.getCodecCompatibleName)(parsedCodec, preferManagedMediaSource);
        }
        logger.warn(`Unhandled audio codec "${parsedCodec}" in mp4 MAP`);
        return parsedCodec || 'mp4a';
    }
    // Provide defaults based on codec type
    // This allows for some playback of some fmp4 playlists without CODECS defined in manifest
    logger.warn(`Unhandled video codec "${parsedCodec}" in mp4 MAP`);
    return parsedCodec || 'avc1';
}
exports.default = PassThroughRemuxer;
