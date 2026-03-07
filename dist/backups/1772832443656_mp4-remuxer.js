"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePts = normalizePts;
exports.flushTextTrackMetadataCueSamples = flushTextTrackMetadataCueSamples;
exports.flushTextTrackUserdataCueSamples = flushTextTrackUserdataCueSamples;
const aac_helper_1 = __importDefault(require("./aac-helper"));
const mp4_generator_1 = __importDefault(require("./mp4-generator"));
const errors_1 = require("../errors");
const events_1 = require("../events");
const loader_1 = require("../types/loader");
const logger_1 = require("../utils/logger");
const timescale_conversion_1 = require("../utils/timescale-conversion");
const MAX_SILENT_FRAME_DURATION = 10 * 1000; // 10 seconds
const AAC_SAMPLES_PER_FRAME = 1024;
const MPEG_AUDIO_SAMPLE_PER_FRAME = 1152;
const AC3_SAMPLES_PER_FRAME = 1536;
let chromeVersion = null;
let safariWebkitVersion = null;
function createMp4Sample(isKeyframe, duration, size, cts) {
    return {
        duration,
        size,
        cts,
        flags: {
            isLeading: 0,
            isDependedOn: 0,
            hasRedundancy: 0,
            degradPrio: 0,
            dependsOn: isKeyframe ? 2 : 1,
            isNonSync: isKeyframe ? 0 : 1,
        },
    };
}
class MP4Remuxer extends logger_1.Logger {
    observer;
    config;
    typeSupported;
    ISGenerated = false;
    _initPTS = null;
    _initDTS = null;
    nextVideoTs = null;
    nextAudioTs = null;
    videoSampleDuration = null;
    isAudioContiguous = false;
    isVideoContiguous = false;
    videoTrackConfig;
    constructor(observer, config, typeSupported, logger) {
        super('mp4-remuxer', logger);
        this.observer = observer;
        this.config = config;
        this.typeSupported = typeSupported;
        this.ISGenerated = false;
        if (chromeVersion === null) {
            const userAgent = navigator.userAgent || '';
            const result = userAgent.match(/Chrome\/(\d+)/i);
            chromeVersion = result ? parseInt(result[1]) : 0;
        }
        if (safariWebkitVersion === null) {
            const result = navigator.userAgent.match(/Safari\/(\d+)/i);
            safariWebkitVersion = result ? parseInt(result[1]) : 0;
        }
    }
    destroy() {
        // @ts-ignore
        this.config = this.videoTrackConfig = this._initPTS = this._initDTS = null;
    }
    resetTimeStamp(defaultTimeStamp) {
        const initPTS = this._initPTS;
        if (!initPTS ||
            !defaultTimeStamp ||
            defaultTimeStamp.trackId !== initPTS.trackId ||
            defaultTimeStamp.baseTime !== initPTS.baseTime ||
            defaultTimeStamp.timescale !== initPTS.timescale) {
            this.log(`Reset initPTS: ${initPTS ? (0, timescale_conversion_1.timestampToString)(initPTS) : initPTS} > ${defaultTimeStamp ? (0, timescale_conversion_1.timestampToString)(defaultTimeStamp) : defaultTimeStamp}`);
        }
        this._initPTS = this._initDTS = defaultTimeStamp;
    }
    resetNextTimestamp() {
        this.log('reset next timestamp');
        this.isVideoContiguous = false;
        this.isAudioContiguous = false;
    }
    resetInitSegment() {
        this.log('ISGenerated flag reset');
        this.ISGenerated = false;
        this.videoTrackConfig = undefined;
    }
    getVideoStartPts(videoSamples) {
        // Get the minimum PTS value relative to the first sample's PTS, normalized for 33-bit wrapping
        let rolloverDetected = false;
        const firstPts = videoSamples[0].pts;
        const startPTS = videoSamples.reduce((minPTS, sample) => {
            let pts = sample.pts;
            let delta = pts - minPTS;
            if (delta < -4294967296) {
                // 2^32, see PTSNormalize for reasoning, but we're hitting a rollover here, and we don't want that to impact the timeOffset calculation
                rolloverDetected = true;
                pts = normalizePts(pts, firstPts);
                delta = pts - minPTS;
            }
            if (delta > 0) {
                return minPTS;
            }
            return pts;
        }, firstPts);
        if (rolloverDetected) {
            this.debug('PTS rollover detected');
        }
        return startPTS;
    }
    remux(audioTrack, videoTrack, id3Track, textTrack, timeOffset, accurateTimeOffset, flush, playlistType) {
        let video;
        let audio;
        let initSegment;
        let text;
        let id3;
        let independent;
        let audioTimeOffset = timeOffset;
        let videoTimeOffset = timeOffset;
        // If we're remuxing audio and video progressively, wait until we've received enough samples for each track before proceeding.
        // This is done to synchronize the audio and video streams. We know if the current segment will have samples if the "pid"
        // parameter is greater than -1. The pid is set when the PMT is parsed, which contains the tracks list.
        // However, if the initSegment has already been generated, or we've reached the end of a segment (flush),
        // then we can remux one track without waiting for the other.
        const hasAudio = audioTrack.pid > -1;
        const hasVideo = videoTrack.pid > -1;
        const length = videoTrack.samples.length;
        const enoughAudioSamples = audioTrack.samples.length > 0;
        const enoughVideoSamples = (flush && length > 0) || length > 1;
        const canRemuxAvc = ((!hasAudio || enoughAudioSamples) &&
            (!hasVideo || enoughVideoSamples)) ||
            this.ISGenerated ||
            flush;
        if (canRemuxAvc) {
            if (this.ISGenerated) {
                const config = this.videoTrackConfig;
                if ((config &&
                    (videoTrack.width !== config.width ||
                        videoTrack.height !== config.height ||
                        videoTrack.pixelRatio?.[0] !== config.pixelRatio?.[0] ||
                        videoTrack.pixelRatio?.[1] !== config.pixelRatio?.[1])) ||
                    (!config && enoughVideoSamples) ||
                    (this.nextAudioTs === null && enoughAudioSamples)) {
                    this.resetInitSegment();
                }
            }
            if (!this.ISGenerated) {
                initSegment = this.generateIS(audioTrack, videoTrack, timeOffset, accurateTimeOffset);
            }
            const isVideoContiguous = this.isVideoContiguous;
            let firstKeyFrameIndex = -1;
            let firstKeyFramePTS;
            if (enoughVideoSamples) {
                firstKeyFrameIndex = findKeyframeIndex(videoTrack.samples);
                if (!isVideoContiguous && this.config.forceKeyFrameOnDiscontinuity) {
                    independent = true;
                    if (firstKeyFrameIndex > 0) {
                        this.warn(`Dropped ${firstKeyFrameIndex} out of ${length} video samples due to a missing keyframe`);
                        const startPTS = this.getVideoStartPts(videoTrack.samples);
                        videoTrack.samples = videoTrack.samples.slice(firstKeyFrameIndex);
                        videoTrack.dropped += firstKeyFrameIndex;
                        videoTimeOffset +=
                            (videoTrack.samples[0].pts - startPTS) /
                                videoTrack.inputTimeScale;
                        firstKeyFramePTS = videoTimeOffset;
                    }
                    else if (firstKeyFrameIndex === -1) {
                        this.warn(`No keyframe found out of ${length} video samples`);
                        independent = false;
                    }
                }
            }
            if (this.ISGenerated) {
                if (enoughAudioSamples && enoughVideoSamples) {
                    // timeOffset is expected to be the offset of the first timestamp of this fragment (first DTS)
                    // if first audio DTS is not aligned with first video DTS then we need to take that into account
                    // when providing timeOffset to remuxAudio / remuxVideo. if we don't do that, there might be a permanent / small
                    // drift between audio and video streams
                    const startPTS = this.getVideoStartPts(videoTrack.samples);
                    const tsDelta = normalizePts(audioTrack.samples[0].pts, startPTS) - startPTS;
                    const audiovideoTimestampDelta = tsDelta / videoTrack.inputTimeScale;
                    audioTimeOffset += Math.max(0, audiovideoTimestampDelta);
                    videoTimeOffset += Math.max(0, -audiovideoTimestampDelta);
                }
                // Purposefully remuxing audio before video, so that remuxVideo can use nextAudioPts, which is calculated in remuxAudio.
                if (enoughAudioSamples) {
                    // if initSegment was generated without audio samples, regenerate it again
                    if (!audioTrack.samplerate) {
                        this.warn('regenerate InitSegment as audio detected');
                        initSegment = this.generateIS(audioTrack, videoTrack, timeOffset, accurateTimeOffset);
                    }
                    audio = this.remuxAudio(audioTrack, audioTimeOffset, this.isAudioContiguous, accurateTimeOffset, hasVideo ||
                        enoughVideoSamples ||
                        playlistType === loader_1.PlaylistLevelType.AUDIO
                        ? videoTimeOffset
                        : undefined);
                    if (enoughVideoSamples) {
                        const audioTrackLength = audio ? audio.endPTS - audio.startPTS : 0;
                        // if initSegment was generated without video samples, regenerate it again
                        if (!videoTrack.inputTimeScale) {
                            this.warn('regenerate InitSegment as video detected');
                            initSegment = this.generateIS(audioTrack, videoTrack, timeOffset, accurateTimeOffset);
                        }
                        video = this.remuxVideo(videoTrack, videoTimeOffset, isVideoContiguous, audioTrackLength);
                    }
                }
                else if (enoughVideoSamples) {
                    video = this.remuxVideo(videoTrack, videoTimeOffset, isVideoContiguous, 0);
                }
                if (video) {
                    video.firstKeyFrame = firstKeyFrameIndex;
                    video.independent = firstKeyFrameIndex !== -1;
                    video.firstKeyFramePTS = firstKeyFramePTS;
                }
            }
        }
        // Allow ID3 and text to remux, even if more audio/video samples are required
        if (this.ISGenerated && this._initPTS && this._initDTS) {
            if (id3Track.samples.length) {
                id3 = flushTextTrackMetadataCueSamples(id3Track, timeOffset, this._initPTS, this._initDTS);
            }
            if (textTrack.samples.length) {
                text = flushTextTrackUserdataCueSamples(textTrack, timeOffset, this._initPTS);
            }
        }
        return {
            audio,
            video,
            initSegment,
            independent,
            text,
            id3,
        };
    }
    computeInitPts(basetime, timescale, presentationTime, type) {
        const offset = Math.round(presentationTime * timescale);
        let timestamp = normalizePts(basetime, offset);
        if (timestamp < offset + timescale) {
            this.log(`Adjusting PTS for rollover in timeline near ${(offset - timestamp) / timescale} ${type}`);
            while (timestamp < offset + timescale) {
                timestamp += 8589934592;
            }
        }
        return timestamp - offset;
    }
    generateIS(audioTrack, videoTrack, timeOffset, accurateTimeOffset) {
        const audioSamples = audioTrack.samples;
        const videoSamples = videoTrack.samples;
        const typeSupported = this.typeSupported;
        const tracks = {};
        const _initPTS = this._initPTS;
        let computePTSDTS = !_initPTS || accurateTimeOffset;
        let container = 'audio/mp4';
        let initPTS;
        let initDTS;
        let timescale;
        let trackId = -1;
        if (computePTSDTS) {
            initPTS = initDTS = Infinity;
        }
        if (audioTrack.config && audioSamples.length) {
            // let's use audio sampling rate as MP4 time scale.
            // rationale is that there is a integer nb of audio frames per audio sample (1024 for AAC)
            // using audio sampling rate here helps having an integer MP4 frame duration
            // this avoids potential rounding issue and AV sync issue
            audioTrack.timescale = audioTrack.samplerate;
            switch (audioTrack.segmentCodec) {
                case 'mp3':
                    if (typeSupported.mpeg) {
                        // Chrome and Safari
                        container = 'audio/mpeg';
                        audioTrack.codec = '';
                    }
                    else if (typeSupported.mp3) {
                        // Firefox
                        audioTrack.codec = 'mp3';
                    }
                    break;
                case 'ac3':
                    audioTrack.codec = 'ac-3';
                    break;
            }
            tracks.audio = {
                id: 'audio',
                container: container,
                codec: audioTrack.codec,
                initSegment: audioTrack.segmentCodec === 'mp3' && typeSupported.mpeg
                    ? new Uint8Array(0)
                    : mp4_generator_1.default.initSegment([audioTrack]),
                metadata: {
                    channelCount: audioTrack.channelCount,
                },
            };
            if (computePTSDTS) {
                trackId = audioTrack.id;
                timescale = audioTrack.inputTimeScale;
                if (!_initPTS || timescale !== _initPTS.timescale) {
                    // remember first PTS of this demuxing context. for audio, PTS = DTS
                    initPTS = initDTS = this.computeInitPts(audioSamples[0].pts, timescale, timeOffset, 'audio');
                }
                else {
                    computePTSDTS = false;
                }
            }
        }
        if (videoTrack.sps && videoTrack.pps && videoSamples.length) {
            // let's use input time scale as MP4 video timescale
            // we use input time scale straight away to avoid rounding issues on frame duration / cts computation
            videoTrack.timescale = videoTrack.inputTimeScale;
            tracks.video = {
                id: 'main',
                container: 'video/mp4',
                codec: videoTrack.codec,
                initSegment: mp4_generator_1.default.initSegment([videoTrack]),
                metadata: {
                    width: videoTrack.width,
                    height: videoTrack.height,
                },
            };
            if (computePTSDTS) {
                trackId = videoTrack.id;
                timescale = videoTrack.inputTimeScale;
                if (!_initPTS || timescale !== _initPTS.timescale) {
                    const basePTS = this.getVideoStartPts(videoSamples);
                    const baseDTS = normalizePts(videoSamples[0].dts, basePTS);
                    const videoInitDTS = this.computeInitPts(baseDTS, timescale, timeOffset, 'video');
                    const videoInitPTS = this.computeInitPts(basePTS, timescale, timeOffset, 'video');
                    initDTS = Math.min(initDTS, videoInitDTS);
                    initPTS = Math.min(initPTS, videoInitPTS);
                }
                else {
                    computePTSDTS = false;
                }
            }
            this.videoTrackConfig = {
                width: videoTrack.width,
                height: videoTrack.height,
                pixelRatio: videoTrack.pixelRatio,
            };
        }
        if (Object.keys(tracks).length) {
            this.ISGenerated = true;
            if (computePTSDTS) {
                if (_initPTS) {
                    this.warn(`Timestamps at playlist time: ${accurateTimeOffset ? '' : '~'}${timeOffset} ${initPTS / timescale} != initPTS: ${_initPTS.baseTime / _initPTS.timescale} (${_initPTS.baseTime}/${_initPTS.timescale}) trackId: ${_initPTS.trackId}`);
                }
                this.log(`Found initPTS at playlist time: ${timeOffset} offset: ${initPTS / timescale} (${initPTS}/${timescale}) trackId: ${trackId}`);
                this._initPTS = {
                    baseTime: initPTS,
                    timescale: timescale,
                    trackId: trackId,
                };
                this._initDTS = {
                    baseTime: initDTS,
                    timescale: timescale,
                    trackId: trackId,
                };
            }
            else {
                initPTS = timescale = undefined;
            }
            return {
                tracks,
                initPTS,
                timescale,
                trackId,
            };
        }
    }
    remuxVideo(track, timeOffset, contiguous, audioTrackLength) {
        const timeScale = track.inputTimeScale;
        const inputSamples = track.samples;
        const outputSamples = [];
        const nbSamples = inputSamples.length;
        const initPTS = this._initPTS;
        const initTime = (initPTS.baseTime * timeScale) / initPTS.timescale;
        let nextVideoTs = this.nextVideoTs;
        let offset = 8;
        let mp4SampleDuration = this.videoSampleDuration;
        let firstDTS;
        let lastDTS;
        let minPTS = Number.POSITIVE_INFINITY;
        let maxPTS = Number.NEGATIVE_INFINITY;
        let sortSamples = false;
        // if parsed fragment is contiguous with last one, let's use last DTS value as reference
        if (!contiguous || nextVideoTs === null) {
            const pts = initTime + timeOffset * timeScale;
            const cts = inputSamples[0].pts -
                normalizePts(inputSamples[0].dts, inputSamples[0].pts);
            if (chromeVersion &&
                nextVideoTs !== null &&
                Math.abs(pts - cts - (nextVideoTs + initTime)) < 15000) {
                // treat as contigous to adjust samples that would otherwise produce video buffer gaps in Chrome
                contiguous = true;
            }
            else {
                // if not contiguous, let's use target timeOffset
                nextVideoTs = pts - cts - initTime;
            }
        }
        // PTS is coded on 33bits, and can loop from -2^32 to 2^32
        // PTSNormalize will make PTS/DTS value monotonic, we use last known DTS value as reference value
        const nextVideoPts = nextVideoTs + initTime;
        for (let i = 0; i < nbSamples; i++) {
            const sample = inputSamples[i];
            sample.pts = normalizePts(sample.pts, nextVideoPts);
            sample.dts = normalizePts(sample.dts, nextVideoPts);
            if (sample.dts < inputSamples[i > 0 ? i - 1 : i].dts) {
                sortSamples = true;
            }
        }
        // sort video samples by DTS then PTS then demux id order
        if (sortSamples) {
            inputSamples.sort(function (a, b) {
                const deltadts = a.dts - b.dts;
                const deltapts = a.pts - b.pts;
                return deltadts || deltapts;
            });
        }
        // Get first/last DTS
        firstDTS = inputSamples[0].dts;
        lastDTS = inputSamples[inputSamples.length - 1].dts;
        // Sample duration (as expected by trun MP4 boxes), should be the delta between sample DTS
        // set this constant duration as being the avg delta between consecutive DTS.
        const inputDuration = lastDTS - firstDTS;
        const averageSampleDuration = inputDuration
            ? Math.round(inputDuration / (nbSamples - 1))
            : mp4SampleDuration || track.inputTimeScale / 30;
        // if fragment are contiguous, detect hole/overlapping between fragments
        if (contiguous) {
            // check timestamp continuity across consecutive fragments (this is to remove inter-fragment gap/hole)
            const delta = firstDTS - nextVideoPts;
            const foundHole = delta > averageSampleDuration;
            const foundOverlap = delta < -1;
            if (foundHole || foundOverlap) {
                if (foundHole) {
                    this.warn(`${(track.segmentCodec || '').toUpperCase()}: ${(0, timescale_conversion_1.toMsFromMpegTsClock)(delta, true)} ms (${delta}dts) hole between fragments detected at ${timeOffset.toFixed(3)}`);
                }
                else {
                    this.warn(`${(track.segmentCodec || '').toUpperCase()}: ${(0, timescale_conversion_1.toMsFromMpegTsClock)(-delta, true)} ms (${delta}dts) overlapping between fragments detected at ${timeOffset.toFixed(3)}`);
                }
                if (!foundOverlap ||
                    nextVideoPts >= inputSamples[0].pts ||
                    chromeVersion) {
                    firstDTS = nextVideoPts;
                    const firstPTS = inputSamples[0].pts - delta;
                    if (foundHole) {
                        inputSamples[0].dts = firstDTS;
                        inputSamples[0].pts = firstPTS;
                    }
                    else {
                        let isPTSOrderRetained = true;
                        for (let i = 0; i < inputSamples.length; i++) {
                            if (inputSamples[i].dts > firstPTS && isPTSOrderRetained) {
                                break;
                            }
                            const prevPTS = inputSamples[i].pts;
                            inputSamples[i].dts -= delta;
                            inputSamples[i].pts -= delta;
                            // check to see if this sample's PTS order has changed
                            // relative to the next one
                            if (i < inputSamples.length - 1) {
                                const nextSamplePTS = inputSamples[i + 1].pts;
                                const currentSamplePTS = inputSamples[i].pts;
                                const currentOrder = nextSamplePTS <= currentSamplePTS;
                                const prevOrder = nextSamplePTS <= prevPTS;
                                isPTSOrderRetained = currentOrder == prevOrder;
                            }
                        }
                    }
                    this.log(`Video: Initial PTS/DTS adjusted: ${(0, timescale_conversion_1.toMsFromMpegTsClock)(firstPTS, true)}/${(0, timescale_conversion_1.toMsFromMpegTsClock)(firstDTS, true)}, delta: ${(0, timescale_conversion_1.toMsFromMpegTsClock)(delta, true)} ms`);
                }
            }
        }
        firstDTS = Math.max(0, firstDTS);
        let nbNalu = 0;
        let naluLen = 0;
        let dtsStep = firstDTS;
        for (let i = 0; i < nbSamples; i++) {
            // compute total/avc sample length and nb of NAL units
            const sample = inputSamples[i];
            const units = sample.units;
            const nbUnits = units.length;
            let sampleLen = 0;
            for (let j = 0; j < nbUnits; j++) {
                sampleLen += units[j].data.length;
            }
            naluLen += sampleLen;
            nbNalu += nbUnits;
            sample.length = sampleLen;
            // ensure sample monotonic DTS
            if (sample.dts < dtsStep) {
                sample.dts = dtsStep;
                dtsStep += (averageSampleDuration / 4) | 0 || 1;
            }
            else {
                dtsStep = sample.dts;
            }
            minPTS = Math.min(sample.pts, minPTS);
            maxPTS = Math.max(sample.pts, maxPTS);
        }
        lastDTS = inputSamples[nbSamples - 1].dts;
        /* concatenate the video data and construct the mdat in place
          (need 8 more bytes to fill length and mpdat type) */
        const mdatSize = naluLen + 4 * nbNalu + 8;
        let mdat;
        try {
            mdat = new Uint8Array(mdatSize);
        }
        catch (err) {
            this.observer.emit(events_1.Events.ERROR, events_1.Events.ERROR, {
                type: errors_1.ErrorTypes.MUX_ERROR,
                details: errors_1.ErrorDetails.REMUX_ALLOC_ERROR,
                fatal: false,
                error: err,
                bytes: mdatSize,
                reason: `fail allocating video mdat ${mdatSize}`,
            });
            return;
        }
        const view = new DataView(mdat.buffer);
        view.setUint32(0, mdatSize);
        mdat.set(mp4_generator_1.default.types.mdat, 4);
        let stretchedLastFrame = false;
        let minDtsDelta = Number.POSITIVE_INFINITY;
        let minPtsDelta = Number.POSITIVE_INFINITY;
        let maxDtsDelta = Number.NEGATIVE_INFINITY;
        let maxPtsDelta = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < nbSamples; i++) {
            const VideoSample = inputSamples[i];
            const VideoSampleUnits = VideoSample.units;
            let mp4SampleLength = 0;
            // convert NALU bitstream to MP4 format (prepend NALU with size field)
            for (let j = 0, nbUnits = VideoSampleUnits.length; j < nbUnits; j++) {
                const unit = VideoSampleUnits[j];
                const unitData = unit.data;
                const unitDataLen = unit.data.byteLength;
                view.setUint32(offset, unitDataLen);
                offset += 4;
                mdat.set(unitData, offset);
                offset += unitDataLen;
                mp4SampleLength += 4 + unitDataLen;
            }
            // expected sample duration is the Decoding Timestamp diff of consecutive samples
            let ptsDelta;
            if (i < nbSamples - 1) {
                mp4SampleDuration = inputSamples[i + 1].dts - VideoSample.dts;
                ptsDelta = inputSamples[i + 1].pts - VideoSample.pts;
            }
            else {
                const config = this.config;
                const lastFrameDuration = i > 0
                    ? VideoSample.dts - inputSamples[i - 1].dts
                    : averageSampleDuration;
                ptsDelta =
                    i > 0
                        ? VideoSample.pts - inputSamples[i - 1].pts
                        : averageSampleDuration;
                if (config.stretchShortVideoTrack && this.nextAudioTs !== null) {
                    // In some cases, a segment's audio track duration may exceed the video track duration.
                    // Since we've already remuxed audio, and we know how long the audio track is, we look to
                    // see if the delta to the next segment is longer than maxBufferHole.
                    // If so, playback would potentially get stuck, so we artificially inflate
                    // the duration of the last frame to minimize any potential gap between segments.
                    const gapTolerance = Math.floor(config.maxBufferHole * timeScale);
                    const deltaToFrameEnd = (audioTrackLength
                        ? minPTS + audioTrackLength * timeScale
                        : this.nextAudioTs + initTime) - VideoSample.pts;
                    if (deltaToFrameEnd > gapTolerance) {
                        // We subtract lastFrameDuration from deltaToFrameEnd to try to prevent any video
                        // frame overlap. maxBufferHole should be >> lastFrameDuration anyway.
                        mp4SampleDuration = deltaToFrameEnd - lastFrameDuration;
                        if (mp4SampleDuration < 0) {
                            mp4SampleDuration = lastFrameDuration;
                        }
                        else {
                            stretchedLastFrame = true;
                        }
                        this.log(`It is approximately ${deltaToFrameEnd / 90} ms to the next segment; using duration ${mp4SampleDuration / 90} ms for the last video frame.`);
                    }
                    else {
                        mp4SampleDuration = lastFrameDuration;
                    }
                }
                else {
                    mp4SampleDuration = lastFrameDuration;
                }
            }
            const compositionTimeOffset = Math.round(VideoSample.pts - VideoSample.dts);
            minDtsDelta = Math.min(minDtsDelta, mp4SampleDuration);
            maxDtsDelta = Math.max(maxDtsDelta, mp4SampleDuration);
            minPtsDelta = Math.min(minPtsDelta, ptsDelta);
            maxPtsDelta = Math.max(maxPtsDelta, ptsDelta);
            outputSamples.push(createMp4Sample(VideoSample.key, mp4SampleDuration, mp4SampleLength, compositionTimeOffset));
        }
        if (outputSamples.length) {
            if (chromeVersion) {
                if (chromeVersion < 70) {
                    // Chrome workaround, mark first sample as being a Random Access Point (keyframe) to avoid sourcebuffer append issue
                    // https://code.google.com/p/chromium/issues/detail?id=229412
                    const flags = outputSamples[0].flags;
                    flags.dependsOn = 2;
                    flags.isNonSync = 0;
                }
            }
            else if (safariWebkitVersion) {
                // Fix for "CNN special report, with CC" in test-streams (Safari browser only)
                // Ignore DTS when frame durations are irregular. Safari MSE does not handle this leading to gaps.
                if (maxPtsDelta - minPtsDelta < maxDtsDelta - minDtsDelta &&
                    averageSampleDuration / maxDtsDelta < 0.025 &&
                    outputSamples[0].cts === 0) {
                    this.warn('Found irregular gaps in sample duration. Using PTS instead of DTS to determine MP4 sample duration.');
                    let dts = firstDTS;
                    for (let i = 0, len = outputSamples.length; i < len; i++) {
                        const nextDts = dts + outputSamples[i].duration;
                        const pts = dts + outputSamples[i].cts;
                        if (i < len - 1) {
                            const nextPts = nextDts + outputSamples[i + 1].cts;
                            outputSamples[i].duration = nextPts - pts;
                        }
                        else {
                            outputSamples[i].duration = i
                                ? outputSamples[i - 1].duration
                                : averageSampleDuration;
                        }
                        outputSamples[i].cts = 0;
                        dts = nextDts;
                    }
                }
            }
        }
        // next AVC/HEVC sample DTS should be equal to last sample DTS + last sample duration (in PES timescale)
        mp4SampleDuration =
            stretchedLastFrame || !mp4SampleDuration
                ? averageSampleDuration
                : mp4SampleDuration;
        const endDTS = lastDTS + mp4SampleDuration;
        this.nextVideoTs = nextVideoTs = endDTS - initTime;
        this.videoSampleDuration = mp4SampleDuration;
        this.isVideoContiguous = true;
        const moof = mp4_generator_1.default.moof(track.sequenceNumber++, firstDTS, Object.assign(track, {
            samples: outputSamples,
        }));
        const type = 'video';
        const data = {
            data1: moof,
            data2: mdat,
            startPTS: (minPTS - initTime) / timeScale,
            endPTS: (maxPTS + mp4SampleDuration - initTime) / timeScale,
            startDTS: (firstDTS - initTime) / timeScale,
            endDTS: nextVideoTs / timeScale,
            type,
            hasAudio: false,
            hasVideo: true,
            nb: outputSamples.length,
            dropped: track.dropped,
        };
        track.samples = [];
        track.dropped = 0;
        return data;
    }
    getSamplesPerFrame(track) {
        switch (track.segmentCodec) {
            case 'mp3':
                return MPEG_AUDIO_SAMPLE_PER_FRAME;
            case 'ac3':
                return AC3_SAMPLES_PER_FRAME;
            default:
                return AAC_SAMPLES_PER_FRAME;
        }
    }
    remuxAudio(track, timeOffset, contiguous, accurateTimeOffset, videoTimeOffset) {
        const inputTimeScale = track.inputTimeScale;
        const mp4timeScale = track.samplerate
            ? track.samplerate
            : inputTimeScale;
        const scaleFactor = inputTimeScale / mp4timeScale;
        const mp4SampleDuration = this.getSamplesPerFrame(track);
        const inputSampleDuration = mp4SampleDuration * scaleFactor;
        const initPTS = this._initPTS;
        const rawMPEG = track.segmentCodec === 'mp3' && this.typeSupported.mpeg;
        const outputSamples = [];
        const alignedWithVideo = videoTimeOffset !== undefined;
        let inputSamples = track.samples;
        let offset = rawMPEG ? 0 : 8;
        let nextAudioTs = this.nextAudioTs || -1;
        // window.audioSamples ? window.audioSamples.push(inputSamples.map(s => s.pts)) : (window.audioSamples = [inputSamples.map(s => s.pts)]);
        // for audio samples, also consider consecutive fragments as being contiguous (even if a level switch occurs),
        // for sake of clarity:
        // consecutive fragments are frags with
        //  - less than 100ms gaps between new time offset (if accurate) and next expected PTS OR
        //  - less than 20 audio frames distance
        // contiguous fragments are consecutive fragments from same quality level (same level, new SN = old SN + 1)
        // this helps ensuring audio continuity
        // and this also avoids audio glitches/cut when switching quality, or reporting wrong duration on first audio frame
        const initTime = (initPTS.baseTime * inputTimeScale) / initPTS.timescale;
        const timeOffsetMpegTS = initTime + timeOffset * inputTimeScale;
        this.isAudioContiguous = contiguous =
            contiguous ||
                (inputSamples.length &&
                    nextAudioTs > 0 &&
                    ((accurateTimeOffset &&
                        Math.abs(timeOffsetMpegTS - (nextAudioTs + initTime)) < 9000) ||
                        Math.abs(normalizePts(inputSamples[0].pts, timeOffsetMpegTS) -
                            (nextAudioTs + initTime)) <
                            20 * inputSampleDuration));
        // compute normalized PTS
        inputSamples.forEach(function (sample) {
            sample.pts = normalizePts(sample.pts, timeOffsetMpegTS);
        });
        if (!contiguous || nextAudioTs < 0) {
            const sampleCount = inputSamples.length;
            // filter out sample with negative PTS that are not playable anyway
            // if we don't remove these negative samples, they will shift all audio samples forward.
            // leading to audio overlap between current / next fragment
            inputSamples = inputSamples.filter((sample) => sample.pts >= 0);
            if (sampleCount !== inputSamples.length) {
                this.warn(`Removed ${inputSamples.length - sampleCount} of ${sampleCount} samples (initPTS ${initTime} / ${inputTimeScale})`);
            }
            // in case all samples have negative PTS, and have been filtered out, return now
            if (!inputSamples.length) {
                return;
            }
            if (videoTimeOffset === 0) {
                // Set the start to match video so that start gaps larger than inputSampleDuration are filled with silence
                nextAudioTs = 0;
            }
            else if (accurateTimeOffset && !alignedWithVideo) {
                // When not seeking, not live, and LevelDetails.PTSKnown, use fragment start as predicted next audio PTS
                nextAudioTs = Math.max(0, timeOffsetMpegTS - initTime);
            }
            else {
                // if frags are not contiguous and if we cant trust time offset, let's use first sample PTS as next audio PTS
                nextAudioTs = inputSamples[0].pts - initTime;
            }
        }
        // If the audio track is missing samples, the frames seem to get "left-shifted" within the
        // resulting mp4 segment, causing sync issues and leaving gaps at the end of the audio segment.
        // In an effort to prevent this from happening, we inject frames here where there are gaps.
        // When possible, we inject a silent frame; when that's not possible, we duplicate the last
        // frame.
        if (track.segmentCodec === 'aac') {
            const maxAudioFramesDrift = this.config.maxAudioFramesDrift;
            for (let i = 0, nextPts = nextAudioTs + initTime; i < inputSamples.length; i++) {
                // First, let's see how far off this frame is from where we expect it to be
                const sample = inputSamples[i];
                const pts = sample.pts;
                const delta = pts - nextPts;
                const duration = Math.abs((1000 * delta) / inputTimeScale);
                // When remuxing with video, if we're overlapping by more than a duration, drop this sample to stay in sync
                if (delta <= -maxAudioFramesDrift * inputSampleDuration &&
                    alignedWithVideo) {
                    if (i === 0) {
                        this.warn(`Audio frame @ ${(pts / inputTimeScale).toFixed(3)}s overlaps marker by ${Math.round((1000 * delta) / inputTimeScale)} ms.`);
                        this.nextAudioTs = nextAudioTs = pts - initTime;
                        nextPts = pts;
                    }
                } // eslint-disable-line brace-style
                // Insert missing frames if:
                // 1: We're more than maxAudioFramesDrift frame away
                // 2: Not more than MAX_SILENT_FRAME_DURATION away
                // 3: currentTime (aka nextPtsNorm) is not 0
                // 4: remuxing with video (videoTimeOffset !== undefined)
                else if (delta >= maxAudioFramesDrift * inputSampleDuration &&
                    duration < MAX_SILENT_FRAME_DURATION &&
                    alignedWithVideo) {
                    let missing = Math.round(delta / inputSampleDuration);
                    // Adjust nextPts so that silent samples are aligned with media pts. This will prevent media samples from
                    // later being shifted if nextPts is based on timeOffset and delta is not a multiple of inputSampleDuration.
                    nextPts = pts - missing * inputSampleDuration;
                    while (nextPts < 0 && missing && inputSampleDuration) {
                        missing--;
                        nextPts += inputSampleDuration;
                    }
                    if (i === 0) {
                        this.nextAudioTs = nextAudioTs = nextPts - initTime;
                    }
                    this.warn(`Injecting ${missing} audio frames @ ${((nextPts - initTime) /
                        inputTimeScale).toFixed(3)}s due to ${Math.round((1000 * delta) / inputTimeScale)} ms gap.`);
                    for (let j = 0; j < missing; j++) {
                        let fillFrame = aac_helper_1.default.getSilentFrame(track.parsedCodec || track.manifestCodec || track.codec, track.channelCount);
                        if (!fillFrame) {
                            this.log('Unable to get silent frame for given audio codec; duplicating last frame instead.');
                            fillFrame = sample.unit.subarray();
                        }
                        inputSamples.splice(i, 0, {
                            unit: fillFrame,
                            pts: nextPts,
                        });
                        nextPts += inputSampleDuration;
                        i++;
                    }
                }
                sample.pts = nextPts;
                nextPts += inputSampleDuration;
            }
        }
        let firstPTS = null;
        let lastPTS = null;
        let mdat;
        let mdatSize = 0;
        let sampleLength = inputSamples.length;
        while (sampleLength--) {
            mdatSize += inputSamples[sampleLength].unit.byteLength;
        }
        for (let j = 0, nbSamples = inputSamples.length; j < nbSamples; j++) {
            const audioSample = inputSamples[j];
            const unit = audioSample.unit;
            let pts = audioSample.pts;
            if (lastPTS !== null) {
                // If we have more than one sample, set the duration of the sample to the "real" duration; the PTS diff with
                // the previous sample
                const prevSample = outputSamples[j - 1];
                prevSample.duration = Math.round((pts - lastPTS) / scaleFactor);
            }
            else {
                if (contiguous && track.segmentCodec === 'aac') {
                    // set PTS/DTS to expected PTS/DTS
                    pts = nextAudioTs + initTime;
                }
                // remember first PTS of our audioSamples
                firstPTS = pts;
                if (mdatSize > 0) {
                    /* concatenate the audio data and construct the mdat in place
                      (need 8 more bytes to fill length and mdat type) */
                    mdatSize += offset;
                    try {
                        mdat = new Uint8Array(mdatSize);
                    }
                    catch (err) {
                        this.observer.emit(events_1.Events.ERROR, events_1.Events.ERROR, {
                            type: errors_1.ErrorTypes.MUX_ERROR,
                            details: errors_1.ErrorDetails.REMUX_ALLOC_ERROR,
                            fatal: false,
                            error: err,
                            bytes: mdatSize,
                            reason: `fail allocating audio mdat ${mdatSize}`,
                        });
                        return;
                    }
                    if (!rawMPEG) {
                        const view = new DataView(mdat.buffer);
                        view.setUint32(0, mdatSize);
                        mdat.set(mp4_generator_1.default.types.mdat, 4);
                    }
                }
                else {
                    // no audio samples
                    return;
                }
            }
            mdat.set(unit, offset);
            const unitLen = unit.byteLength;
            offset += unitLen;
            // Default the sample's duration to the computed mp4SampleDuration, which will either be 1024 for AAC or 1152 for MPEG
            // In the case that we have 1 sample, this will be the duration. If we have more than one sample, the duration
            // becomes the PTS diff with the previous sample
            outputSamples.push(createMp4Sample(true, mp4SampleDuration, unitLen, 0));
            lastPTS = pts;
        }
        // We could end up with no audio samples if all input samples were overlapping with the previously remuxed ones
        const nbSamples = outputSamples.length;
        if (!nbSamples) {
            return;
        }
        // The next audio sample PTS should be equal to last sample PTS + duration
        const lastSample = outputSamples[outputSamples.length - 1];
        nextAudioTs = lastPTS - initTime;
        this.nextAudioTs = nextAudioTs + scaleFactor * lastSample.duration;
        // Set the track samples from inputSamples to outputSamples before remuxing
        const moof = rawMPEG
            ? new Uint8Array(0)
            : mp4_generator_1.default.moof(track.sequenceNumber++, firstPTS / scaleFactor, Object.assign({}, track, { samples: outputSamples }));
        // Clear the track samples. This also clears the samples array in the demuxer, since the reference is shared
        track.samples = [];
        const start = (firstPTS - initTime) / inputTimeScale;
        const end = this.nextAudioTs / inputTimeScale;
        const type = 'audio';
        const audioData = {
            data1: moof,
            data2: mdat,
            startPTS: start,
            endPTS: end,
            startDTS: start,
            endDTS: end,
            type,
            hasAudio: true,
            hasVideo: false,
            nb: nbSamples,
        };
        this.isAudioContiguous = true;
        return audioData;
    }
}
exports.default = MP4Remuxer;
function normalizePts(value, reference) {
    let offset;
    if (reference === null) {
        return value;
    }
    if (reference < value) {
        // - 2^33
        offset = -8589934592;
    }
    else {
        // + 2^33
        offset = 8589934592;
    }
    /* PTS is 33bit (from 0 to 2^33 -1)
      if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
      PTS looping occured. fill the gap */
    while (Math.abs(value - reference) > 4294967296) {
        value += offset;
    }
    return value;
}
function findKeyframeIndex(samples) {
    for (let i = 0; i < samples.length; i++) {
        if (samples[i].key) {
            return i;
        }
    }
    return -1;
}
function flushTextTrackMetadataCueSamples(track, timeOffset, initPTS, initDTS) {
    const length = track.samples.length;
    if (!length) {
        return;
    }
    const inputTimeScale = track.inputTimeScale;
    for (let index = 0; index < length; index++) {
        const sample = track.samples[index];
        // setting id3 pts, dts to relative time
        // using this._initPTS and this._initDTS to calculate relative time
        sample.pts =
            normalizePts(sample.pts - (initPTS.baseTime * inputTimeScale) / initPTS.timescale, timeOffset * inputTimeScale) / inputTimeScale;
        sample.dts =
            normalizePts(sample.dts - (initDTS.baseTime * inputTimeScale) / initDTS.timescale, timeOffset * inputTimeScale) / inputTimeScale;
    }
    const samples = track.samples;
    track.samples = [];
    return {
        samples,
    };
}
function flushTextTrackUserdataCueSamples(track, timeOffset, initPTS) {
    const length = track.samples.length;
    if (!length) {
        return;
    }
    const inputTimeScale = track.inputTimeScale;
    for (let index = 0; index < length; index++) {
        const sample = track.samples[index];
        // setting text pts, dts to relative time
        // using this._initPTS and this._initDTS to calculate relative time
        sample.pts =
            normalizePts(sample.pts - (initPTS.baseTime * inputTimeScale) / initPTS.timescale, timeOffset * inputTimeScale) / inputTimeScale;
    }
    track.samples.sort((a, b) => a.pts - b.pts);
    const samples = track.samples;
    track.samples = [];
    return {
        samples,
    };
}
