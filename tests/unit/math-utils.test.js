
    const { add, isPositive } = require('../../src/utils/math-utils');
    const assert = require('assert');

    try {
      assert.strictEqual(add(2, 3), 5);
      assert.strictEqual(isPositive(5), true);
      console.log('Test Passed');
    } catch (e) {
      console.error('Test Failed');
      process.exit(1);
    }
