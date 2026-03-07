"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("@svta/common-media-library/utils/uuid");
const eventemitter3_1 = require("eventemitter3");
const url_toolkit_1 = require("url-toolkit");
const config_1 = require("./config");
const fragment_tracker_1 = require("./controller/fragment-tracker");
const gap_controller_1 = __importDefault(require("./controller/gap-controller"));
const id3_track_controller_1 = __importDefault(require("./controller/id3-track-controller"));
const latency_controller_1 = __importDefault(require("./controller/latency-controller"));
const level_controller_1 = __importDefault(require("./controller/level-controller"));
const stream_controller_1 = __importDefault(require("./controller/stream-controller"));
const errors_1 = require("./errors");
const events_1 = require("./events");
const is_supported_1 = require("./is-supported");
const key_loader_1 = __importDefault(require("./loader/key-loader"));
const playlist_loader_1 = __importDefault(require("./loader/playlist-loader"));
const demuxer_1 = require("./types/demuxer");
const level_1 = require("./types/level");
const loader_1 = require("./types/loader");
const logger_1 = require("./utils/logger");
const mediacapabilities_helper_1 = require("./utils/mediacapabilities-helper");
const mediasource_helper_1 = require("./utils/mediasource-helper");
const rendition_helper_1 = require("./utils/rendition-helper");
const version_1 = require("./version");
/**
 * The `Hls` class is the core of the HLS.js library used to instantiate player instances.
 * @public
 */
class Hls {
    static defaultConfig;
    /**
     * The runtime configuration used by the player. At instantiation this is combination of `hls.userConfig` merged over `Hls.DefaultConfig`.
     */
    config;
    /**
     * The configuration object provided on player instantiation.
     */
    userConfig;
    /**
     * The logger functions used by this player instance, configured on player instantiation.
     */
    logger;
    coreComponents;
    networkControllers;
    _emitter = new eventemitter3_1.EventEmitter();
    _autoLevelCapping = -1;
    _maxHdcpLevel = null;
    abrController;
    bufferController;
    capLevelController;
    latencyController;
    levelController;
    streamController;
    audioStreamController;
    subtititleStreamController;
    audioTrackController;
    subtitleTrackController;
    interstitialsController;
    gapController;
    emeController;
    cmcdController;
    _media = null;
    _url = null;
    _sessionId;
    triggeringException;
    started = false;
    /**
     * Get the video-dev/hls.js package version.
     */
    static get version() {
        return version_1.version;
    }
    /**
     * Check if the required MediaSource Extensions are available.
     */
    static isMSESupported() {
        return (0, is_supported_1.isMSESupported)();
    }
    /**
     * Check if MediaSource Extensions are available and isTypeSupported checks pass for any baseline codecs.
     */
    static isSupported() {
        return (0, is_supported_1.isSupported)();
    }
    /**
     * Get the MediaSource global used for MSE playback (ManagedMediaSource, MediaSource, or WebKitMediaSource).
     */
    static getMediaSource() {
        return (0, mediasource_helper_1.getMediaSource)();
    }
    static get Events() {
        return events_1.Events;
    }
    static get MetadataSchema() {
        return demuxer_1.MetadataSchema;
    }
    static get ErrorTypes() {
        return errors_1.ErrorTypes;
    }
    static get ErrorDetails() {
        return errors_1.ErrorDetails;
    }
    /**
     * Get the default configuration applied to new instances.
     */
    static get DefaultConfig() {
        if (!Hls.defaultConfig) {
            return config_1.hlsDefaultConfig;
        }
        return Hls.defaultConfig;
    }
    /**
     * Replace the default configuration applied to new instances.
     */
    static set DefaultConfig(defaultConfig) {
        Hls.defaultConfig = defaultConfig;
    }
    /**
     * Creates an instance of an HLS client that can attach to exactly one `HTMLMediaElement`.
     * @param userConfig - Configuration options applied over `Hls.DefaultConfig`
     */
    constructor(userConfig = {}) {
        const logger = (this.logger = (0, logger_1.enableLogs)(userConfig.debug || false, 'Hls instance', userConfig.assetPlayerId));
        const config = (this.config = (0, config_1.mergeConfig)(Hls.DefaultConfig, userConfig, logger));
        this.userConfig = userConfig;
        if (config.progressive) {
            (0, config_1.enableStreamingMode)(config, logger);
        }
        // core controllers and network loaders
        const { abrController: _AbrController, bufferController: _BufferController, capLevelController: _CapLevelController, errorController: _ErrorController, fpsController: _FpsController, } = config;
        const errorController = new _ErrorController(this);
        const abrController = (this.abrController = new _AbrController(this));
        // FragmentTracker must be defined before StreamController because the order of event handling is important
        const fragmentTracker = new fragment_tracker_1.FragmentTracker(this);
        const _InterstitialsController = config.interstitialsController;
        const interstitialsController = _InterstitialsController
            ? (this.interstitialsController = new _InterstitialsController(this, Hls))
            : null;
        const bufferController = (this.bufferController = new _BufferController(this, fragmentTracker));
        const capLevelController = (this.capLevelController =
            new _CapLevelController(this));
        const fpsController = new _FpsController(this);
        const playListLoader = new playlist_loader_1.default(this);
        const _ContentSteeringController = config.contentSteeringController;
        // Instantiate ConentSteeringController before LevelController to receive Multivariant Playlist events first
        const contentSteering = _ContentSteeringController
            ? new _ContentSteeringController(this)
            : null;
        const levelController = (this.levelController = new level_controller_1.default(this, contentSteering));
        const id3TrackController = new id3_track_controller_1.default(this);
        const keyLoader = new key_loader_1.default(this.config, this.logger);
        const streamController = (this.streamController = new stream_controller_1.default(this, fragmentTracker, keyLoader));
        const gapController = (this.gapController = new gap_controller_1.default(this, fragmentTracker));
        // Cap level controller uses streamController to flush the buffer
        capLevelController.setStreamController(streamController);
        // fpsController uses streamController to switch when frames are being dropped
        fpsController.setStreamController(streamController);
        const networkControllers = [
            playListLoader,
            levelController,
            streamController,
        ];
        if (interstitialsController) {
            networkControllers.splice(1, 0, interstitialsController);
        }
        if (contentSteering) {
            networkControllers.splice(1, 0, contentSteering);
        }
        this.networkControllers = networkControllers;
        const coreComponents = [
            abrController,
            bufferController,
            gapController,
            capLevelController,
            fpsController,
            id3TrackController,
            fragmentTracker,
        ];
        this.audioTrackController = this.createController(config.audioTrackController, networkControllers);
        const AudioStreamControllerClass = config.audioStreamController;
        if (AudioStreamControllerClass) {
            networkControllers.push((this.audioStreamController = new AudioStreamControllerClass(this, fragmentTracker, keyLoader)));
        }
        // Instantiate subtitleTrackController before SubtitleStreamController to receive level events first
        this.subtitleTrackController = this.createController(config.subtitleTrackController, networkControllers);
        const SubtitleStreamControllerClass = config.subtitleStreamController;
        if (SubtitleStreamControllerClass) {
            networkControllers.push((this.subtititleStreamController = new SubtitleStreamControllerClass(this, fragmentTracker, keyLoader)));
        }
        this.createController(config.timelineController, coreComponents);
        keyLoader.emeController = this.emeController = this.createController(config.emeController, coreComponents);
        this.cmcdController = this.createController(config.cmcdController, coreComponents);
        this.latencyController = this.createController(latency_controller_1.default, coreComponents);
        this.coreComponents = coreComponents;
        // Error controller handles errors before and after all other controllers
        // This listener will be invoked after all other controllers error listeners
        networkControllers.push(errorController);
        const onErrorOut = errorController.onErrorOut;
        if (typeof onErrorOut === 'function') {
            this.on(events_1.Events.ERROR, onErrorOut, errorController);
        }
        // Autostart load handler
        this.on(events_1.Events.MANIFEST_LOADED, playListLoader.onManifestLoaded, playListLoader);
    }
    createController(ControllerClass, components) {
        if (ControllerClass) {
            const controllerInstance = new ControllerClass(this);
            if (components) {
                components.push(controllerInstance);
            }
            return controllerInstance;
        }
        return null;
    }
    // Delegate the EventEmitter through the public API of Hls.js
    on(event, listener, context = this) {
        this._emitter.on(event, listener, context);
    }
    once(event, listener, context = this) {
        this._emitter.once(event, listener, context);
    }
    removeAllListeners(event) {
        this._emitter.removeAllListeners(event);
    }
    off(event, listener, context = this, once) {
        this._emitter.off(event, listener, context, once);
    }
    listeners(event) {
        return this._emitter.listeners(event);
    }
    emit(event, name, eventObject) {
        return this._emitter.emit(event, name, eventObject);
    }
    trigger(event, eventObject) {
        if (this.config.debug) {
            return this.emit(event, event, eventObject);
        }
        else {
            try {
                return this.emit(event, event, eventObject);
            }
            catch (error) {
                this.logger.error('An internal error happened while handling event ' +
                    event +
                    '. Error message: "' +
                    error.message +
                    '". Here is a stacktrace:', error);
                // Prevent recursion in error event handlers that throw #5497
                if (!this.triggeringException) {
                    this.triggeringException = true;
                    const fatal = event === events_1.Events.ERROR;
                    this.trigger(events_1.Events.ERROR, {
                        type: errors_1.ErrorTypes.OTHER_ERROR,
                        details: errors_1.ErrorDetails.INTERNAL_EXCEPTION,
                        fatal,
                        event,
                        error,
                    });
                    this.triggeringException = false;
                }
            }
        }
        return false;
    }
    listenerCount(event) {
        return this._emitter.listenerCount(event);
    }
    /**
     * Dispose of the instance
     */
    destroy() {
        this.logger.log('destroy');
        this.trigger(events_1.Events.DESTROYING, undefined);
        this.detachMedia();
        this.removeAllListeners();
        this._autoLevelCapping = -1;
        this._url = null;
        this.networkControllers.forEach((component) => component.destroy());
        this.networkControllers.length = 0;
        this.coreComponents.forEach((component) => component.destroy());
        this.coreComponents.length = 0;
        // Remove any references that could be held in config options or callbacks
        const config = this.config;
        config.xhrSetup = config.fetchSetup = undefined;
        // @ts-ignore
        this.userConfig = null;
    }
    /**
     * Attaches Hls.js to a media element
     */
    attachMedia(data) {
        if (!data || ('media' in data && !data.media)) {
            const error = new Error(`attachMedia failed: invalid argument (${data})`);
            this.trigger(events_1.Events.ERROR, {
                type: errors_1.ErrorTypes.OTHER_ERROR,
                details: errors_1.ErrorDetails.ATTACH_MEDIA_ERROR,
                fatal: true,
                error,
            });
            return;
        }
        this.logger.log(`attachMedia`);
        if (this._media) {
            this.logger.warn(`media must be detached before attaching`);
            this.detachMedia();
        }
        const attachMediaSource = 'media' in data;
        const media = attachMediaSource ? data.media : data;
        const attachingData = attachMediaSource ? data : { media };
        this._media = media;
        this.trigger(events_1.Events.MEDIA_ATTACHING, attachingData);
    }
    /**
     * Detach Hls.js from the media
     */
    detachMedia() {
        this.logger.log('detachMedia');
        this.trigger(events_1.Events.MEDIA_DETACHING, {});
        this._media = null;
    }
    /**
     * Detach HTMLMediaElement, MediaSource, and SourceBuffers without reset, for attaching to another instance
     */
    transferMedia() {
        this._media = null;
        const transferMedia = this.bufferController.transferMedia();
        this.trigger(events_1.Events.MEDIA_DETACHING, { transferMedia });
        return transferMedia;
    }
    /**
     * Set the source URL. Can be relative or absolute.
     */
    loadSource(url) {
        this.stopLoad();
        const media = this.media;
        const loadedSource = this._url;
        const loadingSource = (this._url = (0, url_toolkit_1.buildAbsoluteURL)(self.location.href, url, {
            alwaysNormalize: true,
        }));
        this._autoLevelCapping = -1;
        this._maxHdcpLevel = null;
        this.logger.log(`loadSource:${loadingSource}`);
        if (media &&
            loadedSource &&
            (loadedSource !== loadingSource || this.bufferController.hasSourceTypes())) {
            // Remove and re-create MediaSource
            this.detachMedia();
            this.attachMedia(media);
        }
        // when attaching to a source URL, trigger a playlist load
        this.trigger(events_1.Events.MANIFEST_LOADING, { url: url });
    }
    /**
     * Gets the currently loaded URL
     */
    get url() {
        return this._url;
    }
    /**
     * Whether or not enough has been buffered to seek to start position or use `media.currentTime` to determine next load position
     */
    get hasEnoughToStart() {
        return this.streamController.hasEnoughToStart;
    }
    /**
     * Get the startPosition set on startLoad(position) or on autostart with config.startPosition
     */
    get startPosition() {
        return this.streamController.startPositionValue;
    }
    /**
     * Start loading data from the stream source.
     * Depending on default config, client starts loading automatically when a source is set.
     *
     * @param startPosition - Set the start position to stream from.
     * Defaults to -1 (None: starts from earliest point)
     */
    startLoad(startPosition = -1, skipSeekToStartPosition) {
        this.logger.log(`startLoad(${startPosition +
            (skipSeekToStartPosition ? ', <skip seek to start>' : '')})`);
        this.started = true;
        this.resumeBuffering();
        for (let i = 0; i < this.networkControllers.length; i++) {
            this.networkControllers[i].startLoad(startPosition, skipSeekToStartPosition);
            if (!this.started || !this.networkControllers) {
                break;
            }
        }
    }
    /**
     * Stop loading of any stream data.
     */
    stopLoad() {
        this.logger.log('stopLoad');
        this.started = false;
        for (let i = 0; i < this.networkControllers.length; i++) {
            this.networkControllers[i].stopLoad();
            if (this.started || !this.networkControllers) {
                break;
            }
        }
    }
    /**
     * Returns whether loading, toggled with `startLoad()` and `stopLoad()`, is active or not`.
     */
    get loadingEnabled() {
        return this.started;
    }
    /**
     * Returns state of fragment loading toggled by calling `pauseBuffering()` and `resumeBuffering()`.
     */
    get bufferingEnabled() {
        return this.streamController.bufferingEnabled;
    }
    /**
     * Resumes stream controller segment loading after `pauseBuffering` has been called.
     */
    resumeBuffering() {
        if (!this.bufferingEnabled) {
            this.logger.log(`resume buffering`);
            this.networkControllers.forEach((controller) => {
                if (controller.resumeBuffering) {
                    controller.resumeBuffering();
                }
            });
        }
    }
    /**
     * Prevents stream controller from loading new segments until `resumeBuffering` is called.
     * This allows for media buffering to be paused without interupting playlist loading.
     */
    pauseBuffering() {
        if (this.bufferingEnabled) {
            this.logger.log(`pause buffering`);
            this.networkControllers.forEach((controller) => {
                if (controller.pauseBuffering) {
                    controller.pauseBuffering();
                }
            });
        }
    }
    get inFlightFragments() {
        const inFlightData = {
            [loader_1.PlaylistLevelType.MAIN]: this.streamController.inFlightFrag,
        };
        if (this.audioStreamController) {
            inFlightData[loader_1.PlaylistLevelType.AUDIO] =
                this.audioStreamController.inFlightFrag;
        }
        if (this.subtititleStreamController) {
            inFlightData[loader_1.PlaylistLevelType.SUBTITLE] =
                this.subtititleStreamController.inFlightFrag;
        }
        return inFlightData;
    }
    /**
     * Swap through possible audio codecs in the stream (for example to switch from stereo to 5.1)
     */
    swapAudioCodec() {
        this.logger.log('swapAudioCodec');
        this.streamController.swapAudioCodec();
    }
    /**
     * When the media-element fails, this allows to detach and then re-attach it
     * as one call (convenience method).
     *
     * Automatic recovery of media-errors by this process is configurable.
     */
    recoverMediaError() {
        this.logger.log('recoverMediaError');
        const media = this._media;
        const time = media?.currentTime;
        this.detachMedia();
        if (media) {
            this.attachMedia(media);
            if (time) {
                this.startLoad(time);
            }
        }
    }
    removeLevel(levelIndex) {
        this.levelController.removeLevel(levelIndex);
    }
    /**
     * @returns a UUID for this player instance
     */
    get sessionId() {
        let _sessionId = this._sessionId;
        if (!_sessionId) {
            _sessionId = this._sessionId = (0, uuid_1.uuid)();
        }
        return _sessionId;
    }
    /**
     * @returns an array of levels (variants) sorted by HDCP-LEVEL, RESOLUTION (height), FRAME-RATE, CODECS, VIDEO-RANGE, and BANDWIDTH
     */
    get levels() {
        const levels = this.levelController.levels;
        return levels ? levels : [];
    }
    /**
     * @returns LevelDetails of last loaded level (variant) or `null` prior to loading a media playlist.
     */
    get latestLevelDetails() {
        return this.streamController.getLevelDetails() || null;
    }
    /**
     * @returns Level object of selected level (variant) or `null` prior to selecting a level or once the level is removed.
     */
    get loadLevelObj() {
        return this.levelController.loadLevelObj;
    }
    /**
     * Index of quality level (variant) currently played
     */
    get currentLevel() {
        return this.streamController.currentLevel;
    }
    /**
     * Set quality level index immediately. This will flush the current buffer to replace the quality asap. That means playback will interrupt at least shortly to re-buffer and re-sync eventually. Set to -1 for automatic level selection.
     */
    set currentLevel(newLevel) {
        this.logger.log(`set currentLevel:${newLevel}`);
        this.levelController.manualLevel = newLevel;
        this.streamController.immediateLevelSwitch();
    }
    /**
     * Index of next quality level loaded as scheduled by stream controller.
     */
    get nextLevel() {
        return this.streamController.nextLevel;
    }
    /**
     * Set quality level index for next loaded data.
     * This will switch the video quality asap, without interrupting playback.
     * May abort current loading of data, and flush parts of buffer (outside currently played fragment region).
     * @param newLevel - Pass -1 for automatic level selection
     */
    set nextLevel(newLevel) {
        this.logger.log(`set nextLevel:${newLevel}`);
        this.levelController.manualLevel = newLevel;
        this.streamController.nextLevelSwitch();
    }
    /**
     * Return the quality level of the currently or last (of none is loaded currently) segment
     */
    get loadLevel() {
        return this.levelController.level;
    }
    /**
     * Set quality level index for next loaded data in a conservative way.
     * This will switch the quality without flushing, but interrupt current loading.
     * Thus the moment when the quality switch will appear in effect will only be after the already existing buffer.
     * @param newLevel - Pass -1 for automatic level selection
     */
    set loadLevel(newLevel) {
        this.logger.log(`set loadLevel:${newLevel}`);
        this.levelController.manualLevel = newLevel;
    }
    /**
     * get next quality level loaded
     */
    get nextLoadLevel() {
        return this.levelController.nextLoadLevel;
    }
    /**
     * Set quality level of next loaded segment in a fully "non-destructive" way.
     * Same as `loadLevel` but will wait for next switch (until current loading is done).
     */
    set nextLoadLevel(level) {
        this.levelController.nextLoadLevel = level;
    }
    /**
     * Return "first level": like a default level, if not set,
     * falls back to index of first level referenced in manifest
     */
    get firstLevel() {
        return Math.max(this.levelController.firstLevel, this.minAutoLevel);
    }
    /**
     * Sets "first-level", see getter.
     */
    set firstLevel(newLevel) {
        this.logger.log(`set firstLevel:${newLevel}`);
        this.levelController.firstLevel = newLevel;
    }
    /**
     * Return the desired start level for the first fragment that will be loaded.
     * The default value of -1 indicates automatic start level selection.
     * Setting hls.nextAutoLevel without setting a startLevel will result in
     * the nextAutoLevel value being used for one fragment load.
     */
    get startLevel() {
        const startLevel = this.levelController.startLevel;
        if (startLevel === -1 && this.abrController.forcedAutoLevel > -1) {
            return this.abrController.forcedAutoLevel;
        }
        return startLevel;
    }
    /**
     * set  start level (level of first fragment that will be played back)
     * if not overrided by user, first level appearing in manifest will be used as start level
     * if -1 : automatic start level selection, playback will start from level matching download bandwidth
     * (determined from download of first segment)
     */
    set startLevel(newLevel) {
        this.logger.log(`set startLevel:${newLevel}`);
        // if not in automatic start level detection, ensure startLevel is greater than minAutoLevel
        if (newLevel !== -1) {
            newLevel = Math.max(newLevel, this.minAutoLevel);
        }
        this.levelController.startLevel = newLevel;
    }
    /**
     * Whether level capping is enabled.
     * Default value is set via `config.capLevelToPlayerSize`.
     */
    get capLevelToPlayerSize() {
        return this.config.capLevelToPlayerSize;
    }
    /**
     * Enables or disables level capping. If disabled after previously enabled, `nextLevelSwitch` will be immediately called.
     */
    set capLevelToPlayerSize(shouldStartCapping) {
        const newCapLevelToPlayerSize = !!shouldStartCapping;
        if (newCapLevelToPlayerSize !== this.config.capLevelToPlayerSize) {
            if (newCapLevelToPlayerSize) {
                this.capLevelController.startCapping(); // If capping occurs, nextLevelSwitch will happen based on size.
            }
            else {
                this.capLevelController.stopCapping();
                this.autoLevelCapping = -1;
                this.streamController.nextLevelSwitch(); // Now we're uncapped, get the next level asap.
            }
            this.config.capLevelToPlayerSize = newCapLevelToPlayerSize;
        }
    }
    /**
     * Capping/max level value that should be used by automatic level selection algorithm (`ABRController`)
     */
    get autoLevelCapping() {
        return this._autoLevelCapping;
    }
    /**
     * Returns the current bandwidth estimate in bits per second, when available. Otherwise, `NaN` is returned.
     */
    get bandwidthEstimate() {
        const { bwEstimator } = this.abrController;
        if (!bwEstimator) {
            return NaN;
        }
        return bwEstimator.getEstimate();
    }
    set bandwidthEstimate(abrEwmaDefaultEstimate) {
        this.abrController.resetEstimator(abrEwmaDefaultEstimate);
    }
    get abrEwmaDefaultEstimate() {
        const { bwEstimator } = this.abrController;
        if (!bwEstimator) {
            return NaN;
        }
        return bwEstimator.defaultEstimate;
    }
    /**
     * get time to first byte estimate
     * @type {number}
     */
    get ttfbEstimate() {
        const { bwEstimator } = this.abrController;
        if (!bwEstimator) {
            return NaN;
        }
        return bwEstimator.getEstimateTTFB();
    }
    /**
     * Capping/max level value that should be used by automatic level selection algorithm (`ABRController`)
     */
    set autoLevelCapping(newLevel) {
        if (this._autoLevelCapping !== newLevel) {
            this.logger.log(`set autoLevelCapping:${newLevel}`);
            this._autoLevelCapping = newLevel;
            this.levelController.checkMaxAutoUpdated();
        }
    }
    get maxHdcpLevel() {
        return this._maxHdcpLevel;
    }
    set maxHdcpLevel(value) {
        if ((0, level_1.isHdcpLevel)(value) && this._maxHdcpLevel !== value) {
            this._maxHdcpLevel = value;
            this.levelController.checkMaxAutoUpdated();
        }
    }
    /**
     * True when automatic level selection enabled
     */
    get autoLevelEnabled() {
        return this.levelController.manualLevel === -1;
    }
    /**
     * Level set manually (if any)
     */
    get manualLevel() {
        return this.levelController.manualLevel;
    }
    /**
     * min level selectable in auto mode according to config.minAutoBitrate
     */
    get minAutoLevel() {
        const { levels, config: { minAutoBitrate }, } = this;
        if (!levels)
            return 0;
        const len = levels.length;
        for (let i = 0; i < len; i++) {
            if (levels[i].maxBitrate >= minAutoBitrate) {
                return i;
            }
        }
        return 0;
    }
    /**
     * max level selectable in auto mode according to autoLevelCapping
     */
    get maxAutoLevel() {
        const { levels, autoLevelCapping, maxHdcpLevel } = this;
        let maxAutoLevel;
        if (autoLevelCapping === -1 && levels?.length) {
            maxAutoLevel = levels.length - 1;
        }
        else {
            maxAutoLevel = autoLevelCapping;
        }
        if (maxHdcpLevel) {
            for (let i = maxAutoLevel; i--;) {
                const hdcpLevel = levels[i].attrs['HDCP-LEVEL'];
                if (hdcpLevel && hdcpLevel <= maxHdcpLevel) {
                    return i;
                }
            }
        }
        return maxAutoLevel;
    }
    get firstAutoLevel() {
        return this.abrController.firstAutoLevel;
    }
    /**
     * next automatically selected quality level
     */
    get nextAutoLevel() {
        return this.abrController.nextAutoLevel;
    }
    /**
     * this setter is used to force next auto level.
     * this is useful to force a switch down in auto mode:
     * in case of load error on level N, hls.js can set nextAutoLevel to N-1 for example)
     * forced value is valid for one fragment. upon successful frag loading at forced level,
     * this value will be resetted to -1 by ABR controller.
     */
    set nextAutoLevel(nextLevel) {
        this.abrController.nextAutoLevel = nextLevel;
    }
    /**
     * get the datetime value relative to media.currentTime for the active level Program Date Time if present
     */
    get playingDate() {
        return this.streamController.currentProgramDateTime;
    }
    get mainForwardBufferInfo() {
        return this.streamController.getMainFwdBufferInfo();
    }
    get maxBufferLength() {
        return this.streamController.maxBufferLength;
    }
    /**
     * Find and select the best matching audio track, making a level switch when a Group change is necessary.
     * Updates `hls.config.audioPreference`. Returns the selected track, or null when no matching track is found.
     */
    setAudioOption(audioOption) {
        return this.audioTrackController?.setAudioOption(audioOption) || null;
    }
    /**
     * Find and select the best matching subtitle track, making a level switch when a Group change is necessary.
     * Updates `hls.config.subtitlePreference`. Returns the selected track, or null when no matching track is found.
     */
    setSubtitleOption(subtitleOption) {
        return (this.subtitleTrackController?.setSubtitleOption(subtitleOption) || null);
    }
    /**
     * Get the complete list of audio tracks across all media groups
     */
    get allAudioTracks() {
        const audioTrackController = this.audioTrackController;
        return audioTrackController ? audioTrackController.allAudioTracks : [];
    }
    /**
     * Get the list of selectable audio tracks
     */
    get audioTracks() {
        const audioTrackController = this.audioTrackController;
        return audioTrackController ? audioTrackController.audioTracks : [];
    }
    /**
     * index of the selected audio track (index in audio track lists)
     */
    get audioTrack() {
        const audioTrackController = this.audioTrackController;
        return audioTrackController ? audioTrackController.audioTrack : -1;
    }
    /**
     * selects an audio track, based on its index in audio track lists
     */
    set audioTrack(audioTrackId) {
        const audioTrackController = this.audioTrackController;
        if (audioTrackController) {
            audioTrackController.audioTrack = audioTrackId;
        }
    }
    /**
     * get the complete list of subtitle tracks across all media groups
     */
    get allSubtitleTracks() {
        const subtitleTrackController = this.subtitleTrackController;
        return subtitleTrackController
            ? subtitleTrackController.allSubtitleTracks
            : [];
    }
    /**
     * get alternate subtitle tracks list from playlist
     */
    get subtitleTracks() {
        const subtitleTrackController = this.subtitleTrackController;
        return subtitleTrackController
            ? subtitleTrackController.subtitleTracks
            : [];
    }
    /**
     * index of the selected subtitle track (index in subtitle track lists)
     */
    get subtitleTrack() {
        const subtitleTrackController = this.subtitleTrackController;
        return subtitleTrackController ? subtitleTrackController.subtitleTrack : -1;
    }
    get media() {
        return this._media;
    }
    /**
     * select an subtitle track, based on its index in subtitle track lists
     */
    set subtitleTrack(subtitleTrackId) {
        const subtitleTrackController = this.subtitleTrackController;
        if (subtitleTrackController) {
            subtitleTrackController.subtitleTrack = subtitleTrackId;
        }
    }
    /**
     * Whether subtitle display is enabled or not
     */
    get subtitleDisplay() {
        const subtitleTrackController = this.subtitleTrackController;
        return subtitleTrackController
            ? subtitleTrackController.subtitleDisplay
            : false;
    }
    /**
     * Enable/disable subtitle display rendering
     */
    set subtitleDisplay(value) {
        const subtitleTrackController = this.subtitleTrackController;
        if (subtitleTrackController) {
            subtitleTrackController.subtitleDisplay = value;
        }
    }
    /**
     * get mode for Low-Latency HLS loading
     */
    get lowLatencyMode() {
        return this.config.lowLatencyMode;
    }
    /**
     * Enable/disable Low-Latency HLS part playlist and segment loading, and start live streams at playlist PART-HOLD-BACK rather than HOLD-BACK.
     */
    set lowLatencyMode(mode) {
        this.config.lowLatencyMode = mode;
    }
    /**
     * Position (in seconds) of live sync point (ie edge of live position minus safety delay defined by ```hls.config.liveSyncDuration```)
     * @returns null prior to loading live Playlist
     */
    get liveSyncPosition() {
        return this.latencyController.liveSyncPosition;
    }
    /**
     * Estimated position (in seconds) of live edge (ie edge of live playlist plus time sync playlist advanced)
     * @returns 0 before first playlist is loaded
     */
    get latency() {
        return this.latencyController.latency;
    }
    /**
     * maximum distance from the edge before the player seeks forward to ```hls.liveSyncPosition```
     * configured using ```liveMaxLatencyDurationCount``` (multiple of target duration) or ```liveMaxLatencyDuration```
     * @returns 0 before first playlist is loaded
     */
    get maxLatency() {
        return this.latencyController.maxLatency;
    }
    /**
     * target distance from the edge as calculated by the latency controller
     */
    get targetLatency() {
        return this.latencyController.targetLatency;
    }
    set targetLatency(latency) {
        this.latencyController.targetLatency = latency;
    }
    /**
     * the rate at which the edge of the current live playlist is advancing or 1 if there is none
     */
    get drift() {
        return this.latencyController.drift;
    }
    /**
     * set to true when startLoad is called before MANIFEST_PARSED event
     */
    get forceStartLoad() {
        return this.streamController.forceStartLoad;
    }
    /**
     * ContentSteering pathways getter
     */
    get pathways() {
        return this.levelController.pathways;
    }
    /**
     * ContentSteering pathwayPriority getter/setter
     */
    get pathwayPriority() {
        return this.levelController.pathwayPriority;
    }
    set pathwayPriority(pathwayPriority) {
        this.levelController.pathwayPriority = pathwayPriority;
    }
    /**
     * returns true when all SourceBuffers are buffered to the end
     */
    get bufferedToEnd() {
        return !!this.bufferController?.bufferedToEnd;
    }
    /**
     * returns Interstitials Program Manager
     */
    get interstitialsManager() {
        return this.interstitialsController?.interstitialsManager || null;
    }
    /**
     * returns mediaCapabilities.decodingInfo for a variant/rendition
     */
    getMediaDecodingInfo(level, audioTracks = this.allAudioTracks) {
        const audioTracksByGroup = (0, rendition_helper_1.getAudioTracksByGroup)(audioTracks);
        return (0, mediacapabilities_helper_1.getMediaDecodingInfoPromise)(level, audioTracksByGroup, navigator.mediaCapabilities);
    }
}
exports.default = Hls;
