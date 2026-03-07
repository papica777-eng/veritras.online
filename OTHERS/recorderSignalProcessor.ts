import { HybridGodModeWrapper } from "./HybridGodModeWrapper";

/**
 * @wrapper Hybrid_recorderSignalProcessor
 * @description Auto-generated God-Mode Hybrid.
 * @origin "recorderSignalProcessor.js"
 */
export class Hybrid_recorderSignalProcessor extends HybridGodModeWrapper {
    async execute(): Promise<void> {
        try {
            console.log("/// [HYBRID_CORE] Executing Logics from Hybrid_recorderSignalProcessor ///");
            
            // --- START LEGACY INJECTION ---
            "use strict";
let __defProp = Object.defineProperty;
let __getOwnPropDesc = Object.getOwnPropertyDescriptor;
let __getOwnPropNames = Object.getOwnPropertyNames;
let __hasOwnProp = Object.prototype.hasOwnProperty;
let __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
let __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
let __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
let recorderSignalProcessor_exports = {};
__export(recorderSignalProcessor_exports, {
  RecorderSignalProcessor: () => RecorderSignalProcessor
});
module.exports = __toCommonJS(recorderSignalProcessor_exports);
let import_debug = require("../utils/debug");
let import_time = require("../../utils/isomorphic/time");
let import_recorderUtils = require("./recorderUtils");
class RecorderSignalProcessor {
  constructor(actionSink) {
    this._lastAction = null;
    this._delegate = actionSink;
  }
  addAction(actionInContext) {
    this._lastAction = actionInContext;
    this._delegate.addAction(actionInContext);
  }
  signal(pageAlias, frame, signal) {
    const timestamp = (0, import_time.monotonicTime)();
    if (signal.name === "navigation" && frame._page.mainFrame() === frame) {
      const lastAction = this._lastAction;
      const signalThreshold = (0, import_debug.isUnderTest)() ? 500 : 5e3;
      let generateGoto = false;
      if (!lastAction)
        generateGoto = true;
      else if (lastAction.action.name !== "click" && lastAction.action.name !== "press" && lastAction.action.name !== "fill")
        generateGoto = true;
      else if (timestamp - lastAction.startTime > signalThreshold)
        generateGoto = true;
      if (generateGoto) {
        this.addAction({
          frame: {
            pageGuid: frame._page.guid,
            pageAlias,
            framePath: []
          },
          action: {
            name: "navigate",
            url: frame.url(),
            signals: []
          },
          startTime: timestamp,
          endTime: timestamp
        });
      }
      return;
    }
    (0, import_recorderUtils.generateFrameSelector)(frame).then((framePath) => {
      const signalInContext = {
        frame: {
          pageGuid: frame._page.guid,
          pageAlias,
          framePath
        },
        signal,
        timestamp
      };
      this._delegate.addSignal(signalInContext);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RecorderSignalProcessor
});

            // --- END LEGACY INJECTION ---

            await this.recordAxiom({ 
                status: 'SUCCESS', 
                origin: 'Hybrid_recorderSignalProcessor',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("/// [HYBRID_FAULT] Critical Error in Hybrid_recorderSignalProcessor ///", error);
            await this.recordAxiom({ 
                status: 'CRITICAL_FAILURE', 
                error: String(error),
                origin: 'Hybrid_recorderSignalProcessor'
            });
            throw error;
        }
    }
}
