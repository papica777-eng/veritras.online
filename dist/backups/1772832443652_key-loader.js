"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fragment_loader_1 = require("./fragment-loader");
const level_key_1 = require("./level-key");
const errors_1 = require("../errors");
const fragment_1 = require("../loader/fragment");
const hex_1 = require("../utils/hex");
const logger_1 = require("../utils/logger");
const mediakeys_helper_1 = require("../utils/mediakeys-helper");
const mediakeys_helper_2 = require("../utils/mediakeys-helper");
const mp4_tools_1 = require("../utils/mp4-tools");
class KeyLoader extends logger_1.Logger {
    config;
    keyIdToKeyInfo = {};
    emeController = null;
    constructor(config, logger) {
        super('key-loader', logger);
        this.config = config;
    }
    abort(type) {
        for (const id in this.keyIdToKeyInfo) {
            const loader = this.keyIdToKeyInfo[id].loader;
            if (loader) {
                if (type && type !== loader.context?.frag.type) {
                    return;
                }
                loader.abort();
            }
        }
    }
    detach() {
        for (const id in this.keyIdToKeyInfo) {
            const keyInfo = this.keyIdToKeyInfo[id];
            // Remove cached EME keys on detach
            if (keyInfo.mediaKeySessionContext ||
                keyInfo.decryptdata.isCommonEncryption) {
                delete this.keyIdToKeyInfo[id];
            }
        }
    }
    destroy() {
        this.detach();
        for (const id in this.keyIdToKeyInfo) {
            const loader = this.keyIdToKeyInfo[id].loader;
            if (loader) {
                loader.destroy();
            }
        }
        this.keyIdToKeyInfo = {};
    }
    createKeyLoadError(frag, details = errors_1.ErrorDetails.KEY_LOAD_ERROR, error, networkDetails, response) {
        return new fragment_loader_1.LoadError({
            type: errors_1.ErrorTypes.NETWORK_ERROR,
            details,
            fatal: false,
            frag,
            response,
            error,
            networkDetails,
        });
    }
    loadClear(loadingFrag, encryptedFragments, startFragRequested) {
        if (__USE_EME_DRM__ &&
            this.emeController &&
            this.config.emeEnabled &&
            !this.emeController.getSelectedKeySystemFormats().length) {
            // Access key-system with nearest key on start (loading frag is unencrypted)
            if (encryptedFragments.length) {
                for (let i = 0, l = encryptedFragments.length; i < l; i++) {
                    const frag = encryptedFragments[i];
                    // Loading at or before segment with EXT-X-KEY, or first frag loading and last EXT-X-KEY
                    if ((loadingFrag.cc <= frag.cc &&
                        (!(0, fragment_1.isMediaFragment)(loadingFrag) ||
                            !(0, fragment_1.isMediaFragment)(frag) ||
                            loadingFrag.sn < frag.sn)) ||
                        (!startFragRequested && i == l - 1)) {
                        return this.emeController
                            .selectKeySystemFormat(frag)
                            .then((keySystemFormat) => {
                            if (!this.emeController) {
                                return;
                            }
                            frag.setKeyFormat(keySystemFormat);
                            const keySystem = (0, mediakeys_helper_1.keySystemFormatToKeySystemDomain)(keySystemFormat);
                            if (keySystem) {
                                return this.emeController.getKeySystemAccess([keySystem]);
                            }
                        });
                    }
                }
            }
            if (this.config.requireKeySystemAccessOnStart) {
                const keySystemsInConfig = (0, mediakeys_helper_1.getKeySystemsForConfig)(this.config);
                if (keySystemsInConfig.length) {
                    return this.emeController.getKeySystemAccess(keySystemsInConfig);
                }
            }
        }
        return null;
    }
    load(frag) {
        if (!frag.decryptdata &&
            frag.encrypted &&
            this.emeController &&
            this.config.emeEnabled) {
            // Multiple keys, but none selected, resolve in eme-controller
            return this.emeController
                .selectKeySystemFormat(frag)
                .then((keySystemFormat) => {
                return this.loadInternal(frag, keySystemFormat);
            });
        }
        return this.loadInternal(frag);
    }
    loadInternal(frag, keySystemFormat) {
        if (__USE_EME_DRM__ && keySystemFormat) {
            frag.setKeyFormat(keySystemFormat);
        }
        const decryptdata = frag.decryptdata;
        if (!decryptdata) {
            const error = new Error(keySystemFormat
                ? `Expected frag.decryptdata to be defined after setting format ${keySystemFormat}`
                : `Missing decryption data on fragment in onKeyLoading (emeEnabled with controller: ${this.emeController && this.config.emeEnabled})`);
            return Promise.reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.KEY_LOAD_ERROR, error));
        }
        const uri = decryptdata.uri;
        if (!uri) {
            return Promise.reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.KEY_LOAD_ERROR, new Error(`Invalid key URI: "${uri}"`)));
        }
        const id = getKeyId(decryptdata);
        let keyInfo = this.keyIdToKeyInfo[id];
        if (keyInfo?.decryptdata.key) {
            decryptdata.key = keyInfo.decryptdata.key;
            return Promise.resolve({ frag, keyInfo });
        }
        // Return key load promise once it has a mediakey session with an usable key status
        if (this.emeController && keyInfo?.keyLoadPromise) {
            const keyStatus = this.emeController.getKeyStatus(keyInfo.decryptdata);
            switch (keyStatus) {
                case 'usable':
                case 'usable-in-future':
                    return keyInfo.keyLoadPromise.then((keyLoadedData) => {
                        // Return the correct fragment with updated decryptdata key and loaded keyInfo
                        const { keyInfo } = keyLoadedData;
                        decryptdata.key = keyInfo.decryptdata.key;
                        return { frag, keyInfo };
                    });
            }
            // If we have a key session and status and it is not pending or usable, continue
            // This will go back to the eme-controller for expired keys to get a new keyLoadPromise
        }
        // Load the key or return the loading promise
        this.log(`${this.keyIdToKeyInfo[id] ? 'Rel' : 'L'}oading${decryptdata.keyId ? ' keyId: ' + (0, hex_1.arrayToHex)(decryptdata.keyId) : ''} URI: ${decryptdata.uri} from ${frag.type} ${frag.level}`);
        keyInfo = this.keyIdToKeyInfo[id] = {
            decryptdata,
            keyLoadPromise: null,
            loader: null,
            mediaKeySessionContext: null,
        };
        switch (decryptdata.method) {
            case 'SAMPLE-AES':
            case 'SAMPLE-AES-CENC':
            case 'SAMPLE-AES-CTR':
                if (decryptdata.keyFormat === 'identity') {
                    // loadKeyHTTP handles http(s) and data URLs
                    return this.loadKeyHTTP(keyInfo, frag);
                }
                return this.loadKeyEME(keyInfo, frag);
            case 'AES-128':
            case 'AES-256':
            case 'AES-256-CTR':
                return this.loadKeyHTTP(keyInfo, frag);
            default:
                return Promise.reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.KEY_LOAD_ERROR, new Error(`Key supplied with unsupported METHOD: "${decryptdata.method}"`)));
        }
    }
    loadKeyEME(keyInfo, frag) {
        const keyLoadedData = { frag, keyInfo };
        if (this.emeController && this.config.emeEnabled) {
            if (!keyInfo.decryptdata.keyId && frag.initSegment?.data) {
                const keyIds = (0, mp4_tools_1.parseKeyIdsFromTenc)(frag.initSegment.data);
                if (keyIds.length) {
                    let keyId = keyIds[0];
                    if (keyId.some((b) => b !== 0)) {
                        this.log(`Using keyId found in init segment ${(0, hex_1.arrayToHex)(keyId)}`);
                        level_key_1.LevelKey.setKeyIdForUri(keyInfo.decryptdata.uri, keyId);
                    }
                    else {
                        keyId = level_key_1.LevelKey.addKeyIdForUri(keyInfo.decryptdata.uri);
                        this.log(`Generating keyId to patch media ${(0, hex_1.arrayToHex)(keyId)}`);
                    }
                    keyInfo.decryptdata.keyId = keyId;
                }
            }
            if (!keyInfo.decryptdata.keyId && !(0, fragment_1.isMediaFragment)(frag)) {
                // Resolve so that unencrypted init segment is loaded
                // key id is extracted from tenc box when processing key for next segment above
                return Promise.resolve(keyLoadedData);
            }
            const keySessionContextPromise = this.emeController.loadKey(keyLoadedData);
            return (keyInfo.keyLoadPromise = keySessionContextPromise.then((keySessionContext) => {
                keyInfo.mediaKeySessionContext = keySessionContext;
                return keyLoadedData;
            })).catch((error) => {
                // Remove promise for license renewal or retry
                keyInfo.keyLoadPromise = null;
                if ('data' in error) {
                    error.data.frag = frag;
                }
                throw error;
            });
        }
        return Promise.resolve(keyLoadedData);
    }
    loadKeyHTTP(keyInfo, frag) {
        const config = this.config;
        const Loader = config.loader;
        const keyLoader = new Loader(config);
        frag.keyLoader = keyInfo.loader = keyLoader;
        return (keyInfo.keyLoadPromise = new Promise((resolve, reject) => {
            const loaderContext = {
                keyInfo,
                frag,
                responseType: 'arraybuffer',
                url: keyInfo.decryptdata.uri,
            };
            // maxRetry is 0 so that instead of retrying the same key on the same variant multiple times,
            // key-loader will trigger an error and rely on stream-controller to handle retry logic.
            // this will also align retry logic with fragment-loader
            const loadPolicy = config.keyLoadPolicy.default;
            const loaderConfig = {
                loadPolicy,
                timeout: loadPolicy.maxLoadTimeMs,
                maxRetry: 0,
                retryDelay: 0,
                maxRetryDelay: 0,
            };
            const loaderCallbacks = {
                onSuccess: (response, stats, context, networkDetails) => {
                    const { frag, keyInfo } = context;
                    const id = getKeyId(keyInfo.decryptdata);
                    if (!frag.decryptdata || keyInfo !== this.keyIdToKeyInfo[id]) {
                        return reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.KEY_LOAD_ERROR, new Error('after key load, decryptdata unset or changed'), networkDetails));
                    }
                    keyInfo.decryptdata.key = frag.decryptdata.key = new Uint8Array(response.data);
                    // detach fragment key loader on load success
                    frag.keyLoader = null;
                    keyInfo.loader = null;
                    resolve({ frag, keyInfo });
                },
                onError: (response, context, networkDetails, stats) => {
                    this.resetLoader(context);
                    reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.KEY_LOAD_ERROR, new Error(`HTTP Error ${response.code} loading key ${response.text}`), networkDetails, { url: loaderContext.url, data: undefined, ...response }));
                },
                onTimeout: (stats, context, networkDetails) => {
                    this.resetLoader(context);
                    reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.KEY_LOAD_TIMEOUT, new Error('key loading timed out'), networkDetails));
                },
                onAbort: (stats, context, networkDetails) => {
                    this.resetLoader(context);
                    reject(this.createKeyLoadError(frag, errors_1.ErrorDetails.INTERNAL_ABORTED, new Error('key loading aborted'), networkDetails));
                },
            };
            keyLoader.load(loaderContext, loaderConfig, loaderCallbacks);
        }));
    }
    resetLoader(context) {
        const { frag, keyInfo, url: uri } = context;
        const loader = keyInfo.loader;
        if (frag.keyLoader === loader) {
            frag.keyLoader = null;
            keyInfo.loader = null;
        }
        const id = getKeyId(keyInfo.decryptdata) || uri;
        delete this.keyIdToKeyInfo[id];
        if (loader) {
            loader.destroy();
        }
    }
}
exports.default = KeyLoader;
function getKeyId(decryptdata) {
    if (__USE_EME_DRM__ && decryptdata.keyFormat !== mediakeys_helper_2.KeySystemFormats.FAIRPLAY) {
        const keyId = decryptdata.keyId;
        if (keyId) {
            return (0, hex_1.arrayToHex)(keyId);
        }
    }
    return decryptdata.uri;
}
