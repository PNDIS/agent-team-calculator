'use strict';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Fresh calculator state for every test
let calc;
beforeEach(() => {
  // Re-require clears module cache so state resets
  delete require.cache[require.resolve('../src/calculator.js')];
  calc = require('../src/calculator.js');
});

// ── helper ──────────────────────────────────────────────────────────────────
function enter(calc, seq) {
  // seq: array of strings like ['7', '+', '8', '=']
  for (const tok of seq) {
    if (['+', '-', '*', '/'].includes(tok)) {
      calc.pressOperator(tok);
    } else if (tok === '=') {
      calc.pressEquals();
    } else if (tok === 'C') {
      calc.pressClear();
    } else {
      for (const ch of tok) calc.pressDigit(ch);
    }
  }
}

// ── AC1: addition ────────────────────────────────────────────────────────────
test('AC1: 7 + 8 = shows 15', () => {
  enter(calc, ['7', '+', '8', '=']);
  assert.equal(calc.getDisplay(), '15');
});

// ── AC2: all four operators ───────────────────────────────────────────────────
test('AC2: 9 - 4 = shows 5', () => {
  enter(calc, ['9', '-', '4', '=']);
  assert.equal(calc.getDisplay(), '5');
});

test('AC2: 7 * 6 = shows 42', () => {
  enter(calc, ['7', '*', '6', '=']);
  assert.equal(calc.getDisplay(), '42');
});

test('AC2: 8 / 2 = shows 4', () => {
  enter(calc, ['8', '/', '2', '=']);
  assert.equal(calc.getDisplay(), '4');
});

// ── AC3: floating-point / decimal ────────────────────────────────────────────
test('AC3: 0.1 + 0.2 = shows 0.3', () => {
  enter(calc, ['0.1', '+', '0.2', '=']);
  assert.equal(calc.getDisplay(), '0.3');
});

// ── AC4: left-to-right chaining (no precedence) ───────────────────────────────
test('AC4: 2 + 3 * 4 = evaluates left-to-right as 20', () => {
  enter(calc, ['2', '+', '3', '*', '4', '=']);
  assert.equal(calc.getDisplay(), '20');
});

// ── AC5: operator after = continues from result ───────────────────────────────
test('AC5: 5 + 5 = then * 2 = shows 20', () => {
  enter(calc, ['5', '+', '5', '=']);
  assert.equal(calc.getDisplay(), '10');
  enter(calc, ['*', '2', '=']);
  assert.equal(calc.getDisplay(), '20');
});

// ── AC6: divide by zero shows Error; C clears it ─────────────────────────────
test('AC6: 5 / 0 = shows Error', () => {
  enter(calc, ['5', '/', '0', '=']);
  assert.equal(calc.getDisplay(), 'Error');
});

test('AC6: C after Error resets to 0', () => {
  enter(calc, ['5', '/', '0', '=']);
  assert.equal(calc.getDisplay(), 'Error');
  enter(calc, ['C']);
  assert.equal(calc.getDisplay(), '0');
});

test('AC6: calculator is usable again after Error + C', () => {
  enter(calc, ['5', '/', '0', '=']);
  enter(calc, ['C']);
  enter(calc, ['3', '+', '4', '=']);
  assert.equal(calc.getDisplay(), '7');
});

// ── AC7: C clears display to 0 ────────────────────────────────────────────────
test('AC7: C resets display to 0', () => {
  enter(calc, ['9', '+', '9']);
  enter(calc, ['C']);
  assert.equal(calc.getDisplay(), '0');
});

// ── AC8: very long results stay readable ─────────────────────────────────────
test('AC8: formatResult does not produce overly long strings', () => {
  // 1/3 has infinite decimals; result must be ≤ 20 chars
  enter(calc, ['1', '/', '3', '=']);
  const d = calc.getDisplay();
  assert.ok(d.length <= 20, `display too long: "${d}"`);
});

// ── AC11: smoke — module exports the expected functions ───────────────────────
test('AC11: calculator module exports required functions', () => {
  assert.equal(typeof calc.getDisplay,     'function');
  assert.equal(typeof calc.pressDigit,     'function');
  assert.equal(typeof calc.pressOperator,  'function');
  assert.equal(typeof calc.pressEquals,    'function');
  assert.equal(typeof calc.pressClear,     'function');
});
