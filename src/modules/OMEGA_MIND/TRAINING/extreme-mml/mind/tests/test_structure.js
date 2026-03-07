/**
 * test_structure — Qantum Module
 * @module test_structure
 * @path src/modules/OMEGA_MIND/TRAINING/extreme-mml/mind/tests/test_structure.js
 * @auto-documented BrutalDocEngine v2.1
 */

// Тест: Проверка на структурата на проекта
const fs = require('fs');
const assert = require('assert');

const requiredDirs = [
  'soul/data',
  'soul/docs',
  'body/qa',
  'body/scripts',
  'mind/core',
  'mind/tests',
  'mind/demos',
  'mind/docker',
];

for (const dir of requiredDirs) {
  // Complexity: O(1)
  assert(fs.existsSync(`../${dir}`), `Missing directory: ${dir}`);
}

console.log('✅ Структурата на проекта е валидна!');
