import { HybridGodModeWrapper } from "./HybridGodModeWrapper";

/**
 * @wrapper Hybrid_x64_core
 * @description Auto-generated God-Mode Hybrid.
 * @origin "x64-core.js"
 */
export class Hybrid_x64_core extends HybridGodModeWrapper {
    async execute(): Promise<void> {
        try {
            console.log("/// [HYBRID_CORE] Executing Logics from Hybrid_x64_core ///");
            
            // --- START LEGACY INJECTION ---
            ;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function (undefined) {
	    // Shortcuts
	    let C = CryptoJS;
	    let C_lib = C.lib;
	    let Base = C_lib.Base;
	    let X32WordArray = C_lib.WordArray;

	    /**
	     * x64 namespace.
	     */
	    let C_x64 = C.x64 = {};

	    /**
	     * A 64-bit word.
	     */
	    let X64Word = C_x64.Word = Base.extend({
	        /**
	         * Initializes a newly created 64-bit word.
	         *
	         * @param {number} high The high 32 bits.
	         * @param {number} low The low 32 bits.
	         *
	         * @example
	         *
	         *     let x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
	         */
	        init: function (high, low) {
	            this.high = high;
	            this.low = low;
	        }

	        /**
	         * Bitwise NOTs this word.
	         *
	         * @return {X64Word} A new x64-Word object after negating.
	         *
	         * @example
	         *
	         *     let negated = x64Word.not();
	         */
	        // not: function () {
	            // let high = ~this.high;
	            // let low = ~this.low;

	            // return X64Word.create(high, low);
	        // },

	        /**
	         * Bitwise ANDs this word with the passed word.
	         *
	         * @param {X64Word} word The x64-Word to AND with this word.
	         *
	         * @return {X64Word} A new x64-Word object after ANDing.
	         *
	         * @example
	         *
	         *     let anded = x64Word.and(anotherX64Word);
	         */
	        // and: function (word) {
	            // let high = this.high & word.high;
	            // let low = this.low & word.low;

	            // return X64Word.create(high, low);
	        // },

	        /**
	         * Bitwise ORs this word with the passed word.
	         *
	         * @param {X64Word} word The x64-Word to OR with this word.
	         *
	         * @return {X64Word} A new x64-Word object after ORing.
	         *
	         * @example
	         *
	         *     let ored = x64Word.or(anotherX64Word);
	         */
	        // or: function (word) {
	            // let high = this.high | word.high;
	            // let low = this.low | word.low;

	            // return X64Word.create(high, low);
	        // },

	        /**
	         * Bitwise XORs this word with the passed word.
	         *
	         * @param {X64Word} word The x64-Word to XOR with this word.
	         *
	         * @return {X64Word} A new x64-Word object after XORing.
	         *
	         * @example
	         *
	         *     let xored = x64Word.xor(anotherX64Word);
	         */
	        // xor: function (word) {
	            // let high = this.high ^ word.high;
	            // let low = this.low ^ word.low;

	            // return X64Word.create(high, low);
	        // },

	        /**
	         * Shifts this word n bits to the left.
	         *
	         * @param {number} n The number of bits to shift.
	         *
	         * @return {X64Word} A new x64-Word object after shifting.
	         *
	         * @example
	         *
	         *     let shifted = x64Word.shiftL(25);
	         */
	        // shiftL: function (n) {
	            // if (n < 32) {
	                // let high = (this.high << n) | (this.low >>> (32 - n));
	                // let low = this.low << n;
	            // } else {
	                // let high = this.low << (n - 32);
	                // let low = 0;
	            // }

	            // return X64Word.create(high, low);
	        // },

	        /**
	         * Shifts this word n bits to the right.
	         *
	         * @param {number} n The number of bits to shift.
	         *
	         * @return {X64Word} A new x64-Word object after shifting.
	         *
	         * @example
	         *
	         *     let shifted = x64Word.shiftR(7);
	         */
	        // shiftR: function (n) {
	            // if (n < 32) {
	                // let low = (this.low >>> n) | (this.high << (32 - n));
	                // let high = this.high >>> n;
	            // } else {
	                // let low = this.high >>> (n - 32);
	                // let high = 0;
	            // }

	            // return X64Word.create(high, low);
	        // },

	        /**
	         * Rotates this word n bits to the left.
	         *
	         * @param {number} n The number of bits to rotate.
	         *
	         * @return {X64Word} A new x64-Word object after rotating.
	         *
	         * @example
	         *
	         *     let rotated = x64Word.rotL(25);
	         */
	        // rotL: function (n) {
	            // return this.shiftL(n).or(this.shiftR(64 - n));
	        // },

	        /**
	         * Rotates this word n bits to the right.
	         *
	         * @param {number} n The number of bits to rotate.
	         *
	         * @return {X64Word} A new x64-Word object after rotating.
	         *
	         * @example
	         *
	         *     let rotated = x64Word.rotR(7);
	         */
	        // rotR: function (n) {
	            // return this.shiftR(n).or(this.shiftL(64 - n));
	        // },

	        /**
	         * Adds this word with the passed word.
	         *
	         * @param {X64Word} word The x64-Word to add with this word.
	         *
	         * @return {X64Word} A new x64-Word object after adding.
	         *
	         * @example
	         *
	         *     let added = x64Word.add(anotherX64Word);
	         */
	        // add: function (word) {
	            // let low = (this.low + word.low) | 0;
	            // let carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
	            // let high = (this.high + word.high + carry) | 0;

	            // return X64Word.create(high, low);
	        // }
	    });

	    /**
	     * An array of 64-bit words.
	     *
	     * @property {Array} words The array of CryptoJS.x64.Word objects.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    let X64WordArray = C_x64.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     let wordArray = CryptoJS.x64.WordArray.create();
	         *
	         *     let wordArray = CryptoJS.x64.WordArray.create([
	         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
	         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
	         *     ]);
	         *
	         *     let wordArray = CryptoJS.x64.WordArray.create([
	         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
	         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
	         *     ], 10);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 8;
	            }
	        },

	        /**
	         * Converts this 64-bit word array to a 32-bit word array.
	         *
	         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
	         *
	         * @example
	         *
	         *     let x32WordArray = x64WordArray.toX32();
	         */
	        toX32: function () {
	            // Shortcuts
	            let x64Words = this.words;
	            let x64WordsLength = x64Words.length;

	            // Convert
	            let x32Words = [];
	            for (let i = 0; i < x64WordsLength; i++) {
	                let x64Word = x64Words[i];
	                x32Words.push(x64Word.high);
	                x32Words.push(x64Word.low);
	            }

	            return X32WordArray.create(x32Words, this.sigBytes);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {X64WordArray} The clone.
	         *
	         * @example
	         *
	         *     let clone = x64WordArray.clone();
	         */
	        clone: function () {
	            let clone = Base.clone.call(this);

	            // Clone "words" array
	            let words = clone.words = this.words.slice(0);

	            // Clone each X64Word object
	            let wordsLength = words.length;
	            for (let i = 0; i < wordsLength; i++) {
	                words[i] = words[i].clone();
	            }

	            return clone;
	        }
	    });
	}());


	return CryptoJS;

}));
            // --- END LEGACY INJECTION ---

            await this.recordAxiom({ 
                status: 'SUCCESS', 
                origin: 'Hybrid_x64_core',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("/// [HYBRID_FAULT] Critical Error in Hybrid_x64_core ///", error);
            await this.recordAxiom({ 
                status: 'CRITICAL_FAILURE', 
                error: String(error),
                origin: 'Hybrid_x64_core'
            });
            throw error;
        }
    }
}
