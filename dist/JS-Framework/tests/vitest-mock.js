"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vi = exports.afterEach = exports.beforeEach = exports.afterAll = exports.beforeAll = exports.expect = exports.test = exports.it = exports.describe = void 0;
exports.describe = global.describe;
exports.it = global.it;
exports.test = global.test;
exports.expect = global.expect;
exports.beforeAll = global.beforeAll;
exports.afterAll = global.afterAll;
exports.beforeEach = global.beforeEach;
exports.afterEach = global.afterEach;
exports.vi = {
    fn: (...args) => jest.fn(...args),
    spyOn: (...args) => jest.spyOn(...args),
    mock: (...args) => jest.mock(...args),
    useFakeTimers: (...args) => jest.useFakeTimers(...args),
    useRealTimers: (...args) => jest.useRealTimers(...args),
};
