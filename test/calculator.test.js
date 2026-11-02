'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  initialState,
  formatResult,
  compute,
  pressDigit,
  pressDot,
  pressOperator,
  pressEquals,
  pressClear,
} = require('../src/calculator.js');

// Type a string of keys: digits, '.', operators, '=' and 'C'.
function type(state, keys) {
  for (const k of keys) {
    if (/^[0-9]$/.test(k)) state = pressDigit(state, k);
    else if (k === '.') state = pressDot(state);
    else if (k === '=') state = pressEquals(state);
    else if (k === 'C') state = pressClear();
    else state = pressOperator(state, k);
  }
  return state;
}

test('AC1: 7 + 8 = shows 15', () => {
  assert.equal(type(initialState(), '7+8=').display, '15');
});

test('AC2: 9 - 4 = shows 5', () => {
  assert.equal(type(initialState(), '9-4=').display, '5');
});

test('AC2: 7 * 6 = shows 42', () => {
  assert.equal(type(initialState(), '7*6=').display, '42');
});

test('AC2: 8 / 2 = shows 4', () => {
  assert.equal(type(initialState(), '8/2=').display, '4');
});

test('AC3: 0.1 + 0.2 = shows 0.3', () => {
  assert.equal(type(initialState(), '0.1+0.2=').display, '0.3');
});

test('AC4: 2 + 3 * 4 = evaluates left-to-right as 20', () => {
  assert.equal(type(initialState(), '2+3*4=').display, '20');
});

test('AC5: 5 + 5 = then * 2 = shows 20', () => {
  assert.equal(type(initialState(), '5+5=*2=').display, '20');
});

test('AC6: divide by zero shows Error', () => {
  const s = type(initialState(), '5/0=');
  assert.equal(s.display, 'Error');
  assert.equal(s.error, true);
});

test('AC6: after Error, input is ignored until C is pressed', () => {
  let s = type(initialState(), '5/0=');
  const afterDigits = type(s, '7+3');
  assert.equal(afterDigits.display, 'Error');
  const cleared = pressClear();
  assert.equal(cleared.display, '0');
  assert.equal(type(cleared, '2+2=').display, '4');
});

test('AC6/AC7: C clears the error state and resets the display to 0', () => {
  const s = type(initialState(), '5/0=C');
  assert.equal(s.display, '0');
  assert.equal(s.error, false);
});

test('AC7: C resets a mid-entry calculation to 0', () => {
  const s = type(initialState(), '12+34C');
  assert.deepEqual(s, initialState());
});

test('AC8: formatResult keeps long results readable (<= 20 chars)', () => {
  assert.equal(type(initialState(), '1/3=').display, '0.333333333333');
  const big = formatResult(1e100);
  assert.ok(big.length <= 20, `expected <= 20 chars, got ${big}`);
  const tiny = formatResult(1e-21);
  assert.ok(tiny.length <= 20, `expected <= 20 chars, got ${tiny}`);
});

test('AC11: calculator module exports the required functions', () => {
  for (const fn of [initialState, formatResult, compute, pressDigit, pressDot, pressOperator, pressEquals, pressClear]) {
    assert.equal(typeof fn, 'function');
  }
});

test('compute: basic operations and divide-by-zero returns NaN', () => {
  assert.equal(compute(1, '+', 2), 3);
  assert.equal(compute(1, '-', 2), -1);
  assert.equal(compute(3, '*', 4), 12);
  assert.equal(compute(9, '/', 3), 3);
  assert.ok(Number.isNaN(compute(1, '/', 0)));
  assert.equal(compute(1, '?', 2), 2);
});

test('edge: operator can be switched before typing the operand', () => {
  // 5 + - 3 = should compute 5 - 3 = 2
  assert.equal(type(initialState(), '5+-3=').display, '2');
});

test('edge: typing a digit right after = starts a new number on the result', () => {
  // 2 + 2 = 7 -> display shows 7 (new entry, not 47)
  assert.equal(type(initialState(), '2+2=7').display, '7');
});

test('edge: repeated = without an operator is a no-op', () => {
  // 2 + 2 = = -> still 4
  assert.equal(type(initialState(), '2+2==').display, '4');
});

test('edge: multiple dots in one number are ignored', () => {
  assert.equal(type(initialState(), '1.2.3').display, '1.23');
});
