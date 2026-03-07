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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const os = __importStar(require("node:os"));
const node_path_1 = require("node:path");
const node_fs_1 = __importDefault(require("node:fs"));
const url = __importStar(require("node:url"));
const helper_1 = require("../helper");
const __1 = __importDefault(require("../../"));
const readFile = node_fs_1.default.promises.readFile;
const { pid } = process;
const hostname = os.hostname();
// A subset of the test from core.test.js, we don't need all of them to check for compatibility
function runTests(esVersion) {
    (0, node_test_1.default)(`(ts -> ${esVersion}) pino.transport with file`, async (t) => {
        const destination = (0, node_path_1.join)(os.tmpdir(), '_' + Math.random().toString(36).substr(2, 9));
        const transport = __1.default.transport({
            target: (0, node_path_1.join)(__dirname, '..', 'fixtures', 'ts', `to-file-transport.${esVersion}.cjs`),
            options: { destination }
        });
        t.after(transport.end.bind(transport));
        const instance = (0, __1.default)(transport);
        instance.info('hello');
        await (0, helper_1.watchFileCreated)(destination);
        const result = JSON.parse(await readFile(destination, { encoding: 'utf8' }));
        delete result.time;
        node_assert_1.default.deepEqual(result, {
            pid,
            hostname,
            level: 30,
            msg: 'hello'
        });
    });
    (0, node_test_1.default)(`(ts -> ${esVersion}) pino.transport with file URL`, async (t) => {
        const destination = (0, node_path_1.join)(os.tmpdir(), '_' + Math.random().toString(36).substr(2, 9));
        const transport = __1.default.transport({
            target: url.pathToFileURL((0, node_path_1.join)(__dirname, '..', 'fixtures', 'ts', `to-file-transport.${esVersion}.cjs`)).href,
            options: { destination }
        });
        t.after(transport.end.bind(transport));
        const instance = (0, __1.default)(transport);
        instance.info('hello');
        await (0, helper_1.watchFileCreated)(destination);
        const result = JSON.parse(await readFile(destination, { encoding: 'utf8' }));
        delete result.time;
        node_assert_1.default.deepEqual(result, {
            pid,
            hostname,
            level: 30,
            msg: 'hello'
        });
    });
    (0, node_test_1.default)(`(ts -> ${esVersion}) pino.transport with two files`, async (t) => {
        const dest1 = (0, node_path_1.join)(os.tmpdir(), '_' + Math.random().toString(36).substr(2, 9));
        const dest2 = (0, node_path_1.join)(os.tmpdir(), '_' + Math.random().toString(36).substr(2, 9));
        const transport = __1.default.transport({
            targets: [{
                    level: 'info',
                    target: (0, node_path_1.join)(__dirname, '..', 'fixtures', 'ts', `to-file-transport.${esVersion}.cjs`),
                    options: { destination: dest1 }
                }, {
                    level: 'info',
                    target: (0, node_path_1.join)(__dirname, '..', 'fixtures', 'ts', `to-file-transport.${esVersion}.cjs`),
                    options: { destination: dest2 }
                }]
        });
        t.after(transport.end.bind(transport));
        const instance = (0, __1.default)(transport);
        instance.info('hello');
        await Promise.all([(0, helper_1.watchFileCreated)(dest1), (0, helper_1.watchFileCreated)(dest2)]);
        const result1 = JSON.parse(await readFile(dest1, { encoding: 'utf8' }));
        delete result1.time;
        node_assert_1.default.deepEqual(result1, {
            pid,
            hostname,
            level: 30,
            msg: 'hello'
        });
        const result2 = JSON.parse(await readFile(dest2, { encoding: 'utf8' }));
        delete result2.time;
        node_assert_1.default.deepEqual(result2, {
            pid,
            hostname,
            level: 30,
            msg: 'hello'
        });
    });
}
runTests('es5');
runTests('es6');
runTests('es2017');
runTests('esnext');
