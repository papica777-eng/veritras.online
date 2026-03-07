import { HybridGodModeWrapper } from "./HybridGodModeWrapper";

/**
 * @wrapper Hybrid_NodejsStreamOutputAdapter
 * @description Auto-generated God-Mode Hybrid.
 * @origin "NodejsStreamOutputAdapter.js"
 */
export class Hybrid_NodejsStreamOutputAdapter extends HybridGodModeWrapper {
    async execute(): Promise<void> {
        try {
            console.log("/// [HYBRID_CORE] Executing Logics from Hybrid_NodejsStreamOutputAdapter ///");
            
            // --- START LEGACY INJECTION ---
            "use strict";

let Readable = require("readable-stream").Readable;

let utils = require("../utils");
utils.inherits(NodejsStreamOutputAdapter, Readable);

/**
* A nodejs stream using a worker as source.
* @see the SourceWrapper in http://nodejs.org/api/stream.html
* @constructor
* @param {StreamHelper} helper the helper wrapping the worker
* @param {Object} options the nodejs stream options
* @param {Function} updateCb the update callback.
*/
function NodejsStreamOutputAdapter(helper, options, updateCb) {
    Readable.call(this, options);
    this._helper = helper;

    let self = this;
    helper.on("data", function (data, meta) {
        if (!self.push(data)) {
            self._helper.pause();
        }
        if(updateCb) {
            updateCb(meta);
        }
    })
        .on("error", function(e) {
            self.emit("error", e);
        })
        .on("end", function () {
            self.push(null);
        });
}


NodejsStreamOutputAdapter.prototype._read = function() {
    this._helper.resume();
};

module.exports = NodejsStreamOutputAdapter;

            // --- END LEGACY INJECTION ---

            await this.recordAxiom({ 
                status: 'SUCCESS', 
                origin: 'Hybrid_NodejsStreamOutputAdapter',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("/// [HYBRID_FAULT] Critical Error in Hybrid_NodejsStreamOutputAdapter ///", error);
            await this.recordAxiom({ 
                status: 'CRITICAL_FAILURE', 
                error: String(error),
                origin: 'Hybrid_NodejsStreamOutputAdapter'
            });
            throw error;
        }
    }
}
