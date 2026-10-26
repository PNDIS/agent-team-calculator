'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// Load the calculator module (resets state per require)
function freshCalc() {
  // Clear the require cache so each test gets a fresh state
  const modPath = require('node:path').resolve(__dirname, '../src/calculator.js');
  delete require.cache[modPath];
  return require('../src/calculator.js');
}

test('AC1: 7 + 8 = 15', () => {
  const c = freshCalc();
  c.inputDigit('7');
  c.handleOperator('+');
  c.inputDigit('8');
  c.handleEquals();
  assert.equal(c.getDisplay(), '15');
});

test('AC2a: 12 - 5 = 7', () => {
  const c = freshCalc();
  c.inputDigit('1'); c.inputDigit('2');
  c.handleOperator('-');
  c.inputDigit('5');
  c.handleEquals();
  assert.equal(c.getDisplay(), '7');
});

test('AC2b: 6 * 7 = 42', () => {
  const c = freshCalc();
  c.inputDigit('6');
  c.handleOperator('*');
  c.inputDigit('7');
  c.handleEquals();
  assert.equal(c.getDisplay(), '42');
});

test('AC2c: 9 / 4 = 2.25', () => {
  const c = freshCalc();
  c.inputDigit('9');
  c.handleOperator('/');
  c.inputDigit('4');
  c.handleEquals();
  assert.equal(c.getDisplay(), '2.25');
});

test("AC3: divide by zero shows Can't divide by zero", () => {
  const c = freshCalc();
  c.inputDigit('5');
  c.handleOperator('/');
  c.inputDigit('0');
  c.handleEquals();
  assert.equal(c.getDisplay(), "Can't divide by zero");
});

test('AC3: pressing C after divide-by-zero resets to 0', () => {
  const c = freshCalc();
  c.inputDigit('5');
  c.handleOperator('/');
  c.inputDigit('0');
  c.handleEquals();
  c.handleClear();
  assert.equal(c.getDisplay(), '0');
});

test('AC3: new digit after divide-by-zero starts fresh', () => {
  const c = freshCalc();
  c.inputDigit('5');
  c.handleOperator('/');
  c.inputDigit('0');
  c.handleEquals();
  c.inputDigit('3');
  assert.equal(c.getDisplay(), '3');
});

test('AC4: 0.1 + 0.2 = 0.3 (no floating-point noise)', () => {
  const c = freshCalc();
  c.inputDigit('0'); c.inputDecimal(); c.inputDigit('1');
  c.handleOperator('+');
  c.inputDigit('0'); c.inputDecimal(); c.inputDigit('2');
  c.handleEquals();
  assert.equal(c.getDisplay(), '0.3');
});

test('AC5: 2 + 3 = 5, then * 4 = 20 (chaining)', () => {
  const c = freshCalc();
  c.inputDigit('2');
  c.handleOperator('+');
  c.inputDigit('3');
  c.handleEquals();
  assert.equal(c.getDisplay(), '5');
  c.handleOperator('*');
  c.inputDigit('4');
  c.handleEquals();
  assert.equal(c.getDisplay(), '20');
});

test('AC6: C clears to 0', () => {
  const c = freshCalc();
  c.inputDigit('9');
  c.inputDigit('9');
  c.handleClear();
  assert.equal(c.getDisplay(), '0');
});

test('AC6: C clears running calculation', () => {
  const c = freshCalc();
  c.inputDigit('5');
  c.handleOperator('+');
  c.inputDigit('3');
  c.handleClear();
  assert.equal(c.getDisplay(), '0');
  // After clear, new calculation should work cleanly
  c.inputDigit('2');
  c.handleOperator('+');
  c.inputDigit('2');
  c.handleEquals();
  assert.equal(c.getDisplay(), '4');
});

test('formatNumber: large integer stays exact', () => {
  const c = freshCalc();
  assert.equal(c.formatNumber(123456789), '123456789');
});

test('formatNumber: strips floating-point noise', () => {
  const c = freshCalc();
  // 1/3 should not produce unbounded decimals
  const third = 1/3;
  const formatted = c.formatNumber(third);
  assert.ok(formatted.length < 20, `Expected short string, got: ${formatted}`);
});

test('compute: basic operations', () => {
  const c = freshCalc();
  assert.equal(c.compute(10, 5, '+'), 15);
  assert.equal(c.compute(10, 5, '-'), 5);
  assert.equal(c.compute(10, 5, '*'), 50);
  assert.equal(c.compute(10, 5, '/'), 2);
  assert.equal(c.compute(5, 0, '/'), null);
});
