'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../src/calculator.js');

const {
  initialState,
  formatResult,
  compute,
  pressDigit,
  pressDot,
  pressOperator,
  pressEquals,
  pressClear,
} = calc;

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
  assert.equal(type(initialState(), '8/0=').display, 'Error');
});

test('AC6: after Error, input is ignored until C is pressed', () => {
  const errored = type(initialState(), '8/0=');
  const afterDigits = type(errored, '5+5=');
  assert.equal(afterDigits.display, 'Error');
  const cleared = pressClear(afterDigits);
  assert.equal(type(cleared, '2+2=').display, '4');
});

test('AC6/AC7: C clears the error state and resets the display to 0', () => {
  const cleared = pressClear(type(initialState(), '8/0='));
  assert.equal(cleared.display, '0');
  assert.deepEqual(cleared, initialState());
});

test('AC7: C resets a mid-entry calculation to 0', () => {
  assert.equal(type(initialState(), '123+4C').display, '0');
});

test('AC8: formatResult keeps long results readable (<= 20 chars)', () => {
  assert.equal(type(initialState(), '1/3=').display, '0.333333333333');
  const big = formatResult(1.23456789012345e25);
  assert.ok(big.length <= 20, `expected <= 20 chars, got ${big}`);
  const huge = formatResult(1e100);
  assert.ok(huge.length <= 20, `expected <= 20 chars, got ${huge}`);
  const tiny = formatResult(1e-21);
  assert.ok(tiny.length <= 20, `expected <= 20 chars, got ${tiny}`);
});

test('AC11: calculator module exports the required functions', () => {
  for (const fn of [initialState, formatResult, compute, pressDigit, pressDot, pressOperator, pressEquals, pressClear]) {
    assert.equal(typeof fn, 'function');
  }
});

test('compute: basic operations and divide-by-zero returns NaN', () => {
  assert.equal(compute(2, '+', 3), 5);
  assert.equal(compute(2, '-', 3), -1);
  assert.equal(compute(2, '*', 3), 6);
  assert.equal(compute(6, '/', 3), 2);
  assert.ok(Number.isNaN(compute(6, '/', 0)));
});

test('edge: operator can be switched before typing the operand', () => {
  assert.equal(type(initialState(), '5+-3=').display, '2');
});

test('edge: typing a digit right after = starts a new number on the result', () => {
  // after '=', result is the accumulator; a digit replaces the display (new entry)
  assert.equal(type(initialState(), '2+2=7').display, '7');
});

test('edge: repeated = without an operator is a no-op', () => {
  assert.equal(type(initialState(), '2+2===').display, '4');
});

test('edge: multiple dots in one number are ignored', () => {
  assert.equal(type(initialState(), '1.2.3').display, '1.23');
});
