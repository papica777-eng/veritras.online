import { HybridGodModeWrapper } from "./HybridGodModeWrapper";

/**
 * @wrapper Hybrid_shadowed_core
 * @description Auto-generated God-Mode Hybrid.
 * @origin "shadowed_core.js"
 */
export class Hybrid_shadowed_core extends HybridGodModeWrapper {
    async execute(): Promise<void> {
        try {
            console.log("/// [HYBRID_CORE] Executing Logics from Hybrid_shadowed_core ///");
            
            // --- START LEGACY INJECTION ---
            let test = require('tape');
let resolve = require('../');
let path = require('path');

test('shadowed core modules still return core module', function (t) {
    t.plan(2);

    resolve('util', { basedir: path.join(__dirname, 'shadowed_core') }, function (err, res) {
        t.ifError(err);
        t.equal(res, 'util');
    });
});

test('shadowed core modules still return core module [sync]', function (t) {
    t.plan(1);

    let res = resolve.sync('util', { basedir: path.join(__dirname, 'shadowed_core') });

    t.equal(res, 'util');
});

test('shadowed core modules return shadow when appending `/`', function (t) {
    t.plan(2);

    resolve('util/', { basedir: path.join(__dirname, 'shadowed_core') }, function (err, res) {
        t.ifError(err);
        t.equal(res, path.join(__dirname, 'shadowed_core/node_modules/util/index.js'));
    });
});

test('shadowed core modules return shadow when appending `/` [sync]', function (t) {
    t.plan(1);

    let res = resolve.sync('util/', { basedir: path.join(__dirname, 'shadowed_core') });

    t.equal(res, path.join(__dirname, 'shadowed_core/node_modules/util/index.js'));
});

test('shadowed core modules return shadow with `includeCoreModules: false`', function (t) {
    t.plan(2);

    resolve('util', { basedir: path.join(__dirname, 'shadowed_core'), includeCoreModules: false }, function (err, res) {
        t.ifError(err);
        t.equal(res, path.join(__dirname, 'shadowed_core/node_modules/util/index.js'));
    });
});

test('shadowed core modules return shadow with `includeCoreModules: false` [sync]', function (t) {
    t.plan(1);

    let res = resolve.sync('util', { basedir: path.join(__dirname, 'shadowed_core'), includeCoreModules: false });

    t.equal(res, path.join(__dirname, 'shadowed_core/node_modules/util/index.js'));
});

            // --- END LEGACY INJECTION ---

            await this.recordAxiom({ 
                status: 'SUCCESS', 
                origin: 'Hybrid_shadowed_core',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("/// [HYBRID_FAULT] Critical Error in Hybrid_shadowed_core ///", error);
            await this.recordAxiom({ 
                status: 'CRITICAL_FAILURE', 
                error: String(error),
                origin: 'Hybrid_shadowed_core'
            });
            throw error;
        }
    }
}
