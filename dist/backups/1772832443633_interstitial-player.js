"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HlsAssetPlayer = void 0;
const events_1 = require("../events");
const interstitial_event_1 = require("../loader/interstitial-event");
const buffer_helper_1 = require("../utils/buffer-helper");
class HlsAssetPlayer {
    hls;
    interstitial;
    assetItem;
    tracks = null;
    hasDetails = false;
    mediaAttached = null;
    _currentTime;
    _bufferedEosTime;
    constructor(HlsPlayerClass, userConfig, interstitial, assetItem) {
        const hls = (this.hls = new HlsPlayerClass(userConfig));
        this.interstitial = interstitial;
        this.assetItem = assetItem;
        const detailsLoaded = () => {
            this.hasDetails = true;
        };
        hls.once(events_1.Events.LEVEL_LOADED, detailsLoaded);
        hls.once(events_1.Events.AUDIO_TRACK_LOADED, detailsLoaded);
        hls.once(events_1.Events.SUBTITLE_TRACK_LOADED, detailsLoaded);
        hls.on(events_1.Events.MEDIA_ATTACHING, (name, { media }) => {
            this.removeMediaListeners();
            this.mediaAttached = media;
            const event = this.interstitial;
            if (event.playoutLimit) {
                media.addEventListener('timeupdate', this.checkPlayout);
                if (this.appendInPlace) {
                    hls.on(events_1.Events.BUFFER_APPENDED, () => {
                        const bufferedEnd = this.bufferedEnd;
                        if (this.reachedPlayout(bufferedEnd)) {
                            this._bufferedEosTime = bufferedEnd;
                            hls.trigger(events_1.Events.BUFFERED_TO_END, undefined);
                        }
                    });
                }
            }
        });
    }
    get appendInPlace() {
        return this.interstitial.appendInPlace;
    }
    loadSource() {
        const hls = this.hls;
        if (!hls) {
            return;
        }
        if (!hls.url) {
            let uri = this.assetItem.uri;
            try {
                uri = (0, interstitial_event_1.getInterstitialUrl)(uri, hls.config.primarySessionId || '').href;
            }
            catch (error) {
                // Ignore error parsing ASSET_URI or adding _HLS_primary_id to it. The
                // issue should surface as an INTERSTITIAL_ASSET_ERROR loading the asset.
            }
            hls.loadSource(uri);
        }
        else if (hls.levels.length && !hls.started) {
            hls.startLoad(-1, true);
        }
    }
    bufferedInPlaceToEnd(media) {
        if (!this.appendInPlace) {
            return false;
        }
        if (this.hls?.bufferedToEnd) {
            return true;
        }
        if (!media) {
            return false;
        }
        const duration = Math.min(this._bufferedEosTime || Infinity, this.duration);
        const start = this.timelineOffset;
        const bufferInfo = buffer_helper_1.BufferHelper.bufferInfo(media, start, 0);
        const bufferedEnd = this.getAssetTime(bufferInfo.end);
        return bufferedEnd >= duration - 0.02;
    }
    checkPlayout = () => {
        if (this.reachedPlayout(this.currentTime) && this.hls) {
            this.hls.trigger(events_1.Events.PLAYOUT_LIMIT_REACHED, {});
        }
    };
    reachedPlayout(time) {
        const interstitial = this.interstitial;
        const playoutLimit = interstitial.playoutLimit;
        return this.startOffset + time >= playoutLimit;
    }
    get destroyed() {
        return !this.hls?.userConfig;
    }
    get assetId() {
        return this.assetItem.identifier;
    }
    get interstitialId() {
        return this.assetItem.parentIdentifier;
    }
    get media() {
        return this.hls?.media || null;
    }
    get bufferedEnd() {
        const media = this.media || this.mediaAttached;
        if (!media) {
            if (this._bufferedEosTime) {
                return this._bufferedEosTime;
            }
            return this.currentTime;
        }
        const bufferInfo = buffer_helper_1.BufferHelper.bufferInfo(media, media.currentTime, 0.001);
        return this.getAssetTime(bufferInfo.end);
    }
    get currentTime() {
        const media = this.media || this.mediaAttached;
        if (!media) {
            return this._currentTime || 0;
        }
        return this.getAssetTime(media.currentTime);
    }
    get duration() {
        const duration = this.assetItem.duration;
        if (!duration) {
            return 0;
        }
        const playoutLimit = this.interstitial.playoutLimit;
        if (playoutLimit) {
            const assetPlayout = playoutLimit - this.startOffset;
            if (assetPlayout > 0 && assetPlayout < duration) {
                return assetPlayout;
            }
        }
        return duration;
    }
    get remaining() {
        const duration = this.duration;
        if (!duration) {
            return 0;
        }
        return Math.max(0, duration - this.currentTime);
    }
    get startOffset() {
        return this.assetItem.startOffset;
    }
    get timelineOffset() {
        return this.hls?.config.timelineOffset || 0;
    }
    set timelineOffset(value) {
        const timelineOffset = this.timelineOffset;
        if (value !== timelineOffset) {
            const diff = value - timelineOffset;
            if (Math.abs(diff) > 1 / 90000 && this.hls) {
                if (this.hasDetails) {
                    throw new Error(`Cannot set timelineOffset after playlists are loaded`);
                }
                this.hls.config.timelineOffset = value;
            }
        }
    }
    getAssetTime(time) {
        const timelineOffset = this.timelineOffset;
        const duration = this.duration;
        return Math.min(Math.max(0, time - timelineOffset), duration);
    }
    removeMediaListeners() {
        const media = this.mediaAttached;
        if (media) {
            this._currentTime = media.currentTime;
            this.bufferSnapShot();
            media.removeEventListener('timeupdate', this.checkPlayout);
        }
    }
    bufferSnapShot() {
        if (this.mediaAttached) {
            if (this.hls?.bufferedToEnd) {
                this._bufferedEosTime = this.bufferedEnd;
            }
        }
    }
    destroy() {
        this.removeMediaListeners();
        if (this.hls) {
            this.hls.destroy();
        }
        this.hls = null;
        // @ts-ignore
        this.tracks = this.mediaAttached = this.checkPlayout = null;
    }
    attachMedia(data) {
        this.loadSource();
        this.hls?.attachMedia(data);
    }
    detachMedia() {
        this.removeMediaListeners();
        this.mediaAttached = null;
        this.hls?.detachMedia();
    }
    resumeBuffering() {
        this.hls?.resumeBuffering();
    }
    pauseBuffering() {
        this.hls?.pauseBuffering();
    }
    transferMedia() {
        this.bufferSnapShot();
        return this.hls?.transferMedia() || null;
    }
    resetDetails() {
        const hls = this.hls;
        if (hls && this.hasDetails) {
            hls.stopLoad();
            const deleteDetails = (obj) => delete obj.details;
            hls.levels.forEach(deleteDetails);
            hls.allAudioTracks.forEach(deleteDetails);
            hls.allSubtitleTracks.forEach(deleteDetails);
            this.hasDetails = false;
        }
    }
    on(event, listener, context) {
        this.hls?.on(event, listener);
    }
    once(event, listener, context) {
        this.hls?.once(event, listener);
    }
    off(event, listener, context) {
        this.hls?.off(event, listener);
    }
    toString() {
        return `HlsAssetPlayer: ${(0, interstitial_event_1.eventAssetToString)(this.assetItem)} ${this.hls?.sessionId} ${this.appendInPlace ? 'append-in-place' : ''}`;
    }
}
exports.HlsAssetPlayer = HlsAssetPlayer;
