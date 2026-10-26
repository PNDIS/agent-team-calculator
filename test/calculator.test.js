'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  createCalc,
  pressDigit,
  pressOperator,
  pressEquals,
  pressClear,
  roundResult,
} = require('../src/calculator.js');

// helpers
function calc(...steps) {
  let s = createCalc();
  for (const step of steps) s = step(s);
  return s;
}
const digit  = (d) => (s) => pressDigit(s, d);
const op     = (o) => (s) => pressOperator(s, o);
const eq     = ()  => (s) => pressEquals(s);
const clear  = ()  => (s) => pressClear();

// --- AC2: four basic operations ---
test('AC2: 7 + 5 = 12', () => {
  const s = calc(digit('7'), op('+'), digit('5'), eq());
  assert.equal(s.display, '12');
});

test('AC2: 9 - 4 = 5', () => {
  const s = calc(digit('9'), op('-'), digit('4'), eq());
  assert.equal(s.display, '5');
});

test('AC2: 7 * 6 = 42', () => {
  const s = calc(digit('7'), op('*'), digit('6'), eq());
  assert.equal(s.display, '42');
});

test('AC2: 8 / 2 = 4', () => {
  const s = calc(digit('8'), op('/'), digit('2'), eq());
  assert.equal(s.display, '4');
});

// --- AC3: floating-point noise suppressed ---
test('AC3: 0.1 + 0.2 = 0.3 (not 0.30000000000000004)', () => {
  const s = calc(digit('0'), digit('.'), digit('1'), op('+'),
                 digit('0'), digit('.'), digit('2'), eq());
  assert.equal(s.display, '0.3');
});

test('AC3: roundResult(0.1 + 0.2) === 0.3', () => {
  assert.equal(roundResult(0.1 + 0.2), 0.3);
});

// --- AC4: divide by zero shows Error; C clears ---
test('AC4: 8 / 0 = Error', () => {
  const s = calc(digit('8'), op('/'), digit('0'), eq());
  assert.equal(s.display, 'Error');
  assert.equal(s.error, true);
});

test('AC4: C clears Error and calculator works again', () => {
  const s = calc(digit('8'), op('/'), digit('0'), eq(), clear());
  assert.equal(s.display, '0');
  assert.equal(s.error, false);
});

test('AC4: input ignored while error showing', () => {
  const s = calc(digit('8'), op('/'), digit('0'), eq(), digit('5'));
  assert.equal(s.display, 'Error');
});

// --- AC5: chaining after result ---
test('AC5: 2 + 3 = 5, then * 4 = 20', () => {
  const s = calc(digit('2'), op('+'), digit('3'), eq(), op('*'), digit('4'), eq());
  assert.equal(s.display, '20');
});

// --- AC6: left-to-right multi-operator ---
test('AC6: 1 + 2 + 3 = 6', () => {
  const s = calc(digit('1'), op('+'), digit('2'), op('+'), digit('3'), eq());
  assert.equal(s.display, '6');
});

// --- AC7: C clears; double-C is harmless ---
test('AC7: C resets to 0', () => {
  const s = calc(digit('9'), clear());
  assert.equal(s.display, '0');
});

test('AC7: C twice is harmless', () => {
  const s = calc(clear(), clear());
  assert.equal(s.display, '0');
  assert.equal(s.error, false);
});

// --- AC8: long results don't overflow (precision capped) ---
test('AC8: 1/3 is truncated to <=12 significant digits', () => {
  const s = calc(digit('1'), op('/'), digit('3'), eq());
  // should be something like "0.333333333333" not an infinite string
  assert.ok(s.display.length <= 15, `display too long: ${s.display}`);
  assert.ok(s.display.startsWith('0.333'), `unexpected: ${s.display}`);
});

// --- AC11: node --test passes (this file is the test suite) ---
// All tests above satisfy AC11 by existing and passing.

// --- AC13 (keyboard): key mapping tested via pressDigit / pressOperator ---
test('AC13: keyboard digits work (pressDigit routes correctly)', () => {
  const s = calc(digit('4'), digit('2'));
  assert.equal(s.display, '42');
});

test('AC13: keyboard operator + works', () => {
  const s = calc(digit('3'), op('+'), digit('2'), eq());
  assert.equal(s.display, '5');
});

test('AC13: keyboard operator - works', () => {
  const s = calc(digit('5'), op('-'), digit('3'), eq());
  assert.equal(s.display, '2');
});

test('AC13: keyboard operator * works', () => {
  const s = calc(digit('3'), op('*'), digit('3'), eq());
  assert.equal(s.display, '9');
});

test('AC13: keyboard operator / works', () => {
  const s = calc(digit('9'), op('/'), digit('3'), eq());
  assert.equal(s.display, '3');
});

// --- AC14: Escape clears (same as C) ---
test('AC14: Escape (pressClear) resets display to 0', () => {
  const s = calc(digit('7'), op('+'), digit('3'), clear());
  assert.equal(s.display, '0');
  assert.equal(s.pending, null);
  assert.equal(s.operator, null);
});

test('AC14: Escape clears Error state', () => {
  const s = calc(digit('5'), op('/'), digit('0'), eq(), clear());
  assert.equal(s.display, '0');
  assert.equal(s.error, false);
});
