"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = require("eventemitter3");
const transmuxer_1 = __importStar(require("../demux/transmuxer"));
const errors_1 = require("../errors");
const events_1 = require("../events");
const logger_1 = require("../utils/logger");
const transmuxers = [];
if (typeof __IN_WORKER__ !== 'undefined' && __IN_WORKER__) {
    startWorker();
}
function startWorker() {
    self.addEventListener('message', (ev) => {
        const data = ev.data;
        const instanceNo = data.instanceNo;
        if (instanceNo === undefined) {
            return;
        }
        const transmuxer = transmuxers[instanceNo];
        if (data.cmd === 'reset') {
            delete transmuxers[data.resetNo];
            if (transmuxer) {
                transmuxer.destroy();
            }
            data.cmd = 'init';
        }
        if (data.cmd === 'init') {
            const config = JSON.parse(data.config);
            const observer = new eventemitter3_1.EventEmitter();
            observer.on(events_1.Events.FRAG_DECRYPTED, forwardMessage);
            observer.on(events_1.Events.ERROR, forwardMessage);
            const logger = (0, logger_1.enableLogs)(config.debug, data.id);
            forwardWorkerLogs(logger, instanceNo);
            transmuxers[instanceNo] = new transmuxer_1.default(observer, data.typeSupported, config, '', data.id, logger);
            forwardMessage('init', null, instanceNo);
            return;
        }
        if (!transmuxer) {
            return;
        }
        switch (data.cmd) {
            case 'configure': {
                transmuxer.configure(data.config);
                break;
            }
            case 'demux': {
                const transmuxResult = transmuxer.push(data.data, data.decryptdata, data.chunkMeta, data.state);
                if ((0, transmuxer_1.isPromise)(transmuxResult)) {
                    transmuxResult
                        .then((data) => {
                        emitTransmuxComplete(self, data, instanceNo);
                    })
                        .catch((error) => {
                        forwardMessage(events_1.Events.ERROR, {
                            instanceNo,
                            type: errors_1.ErrorTypes.MEDIA_ERROR,
                            details: errors_1.ErrorDetails.FRAG_PARSING_ERROR,
                            chunkMeta: data.chunkMeta,
                            fatal: false,
                            error,
                            err: error,
                            reason: `transmuxer-worker push error`,
                        }, instanceNo);
                    });
                }
                else {
                    emitTransmuxComplete(self, transmuxResult, instanceNo);
                }
                break;
            }
            case 'flush': {
                const chunkMeta = data.chunkMeta;
                const transmuxResult = transmuxer.flush(chunkMeta);
                if ((0, transmuxer_1.isPromise)(transmuxResult)) {
                    transmuxResult
                        .then((results) => {
                        handleFlushResult(self, results, chunkMeta, instanceNo);
                    })
                        .catch((error) => {
                        forwardMessage(events_1.Events.ERROR, {
                            type: errors_1.ErrorTypes.MEDIA_ERROR,
                            details: errors_1.ErrorDetails.FRAG_PARSING_ERROR,
                            chunkMeta: data.chunkMeta,
                            fatal: false,
                            error,
                            err: error,
                            reason: `transmuxer-worker flush error`,
                        }, instanceNo);
                    });
                }
                else {
                    handleFlushResult(self, transmuxResult, chunkMeta, instanceNo);
                }
                break;
            }
            default:
                break;
        }
    });
}
function emitTransmuxComplete(self, transmuxResult, instanceNo) {
    if (isEmptyResult(transmuxResult.remuxResult)) {
        return false;
    }
    const transferable = [];
    const { audio, video } = transmuxResult.remuxResult;
    if (audio) {
        addToTransferable(transferable, audio);
    }
    if (video) {
        addToTransferable(transferable, video);
    }
    self.postMessage({ event: 'transmuxComplete', data: transmuxResult, instanceNo }, transferable);
    return true;
}
// Converts data to a transferable object https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast)
// in order to minimize message passing overhead
function addToTransferable(transferable, track) {
    if (track.data1) {
        transferable.push(track.data1.buffer);
    }
    if (track.data2) {
        transferable.push(track.data2.buffer);
    }
}
function handleFlushResult(self, results, chunkMeta, instanceNo) {
    const parsed = results.reduce((parsed, result) => emitTransmuxComplete(self, result, instanceNo) || parsed, false);
    if (!parsed) {
        // Emit at least one "transmuxComplete" message even if media is not found to update stream-controller state to PARSING
        self.postMessage({
            event: 'transmuxComplete',
            data: results[0],
            instanceNo,
        });
    }
    self.postMessage({ event: 'flush', data: chunkMeta, instanceNo });
}
function forwardMessage(event, data, instanceNo) {
    self.postMessage({ event, data, instanceNo });
}
function forwardWorkerLogs(logger, instanceNo) {
    for (const logFn in logger) {
        logger[logFn] = function () {
            const message = Array.prototype.join.call(arguments, ' ');
            forwardMessage('workerLog', {
                logType: logFn,
                message,
            }, instanceNo);
        };
    }
}
function isEmptyResult(remuxResult) {
    return (!remuxResult.audio &&
        !remuxResult.video &&
        !remuxResult.text &&
        !remuxResult.id3 &&
        !remuxResult.initSegment);
}
