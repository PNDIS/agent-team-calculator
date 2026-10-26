'use strict';

/**
 * Core calculator state and logic for FAC-138.
 * All functions are pure / state-based; no DOM references here.
 */

const MAX_DIGITS = 12;

/**
 * Round away floating-point noise to ~12 significant digits.
 * AC3: 0.1 + 0.2 = 0.3
 * AC8: 1 / 3 = 0.333333333333
 */
function roundResult(n) {
  if (!isFinite(n)) return n;
  // toPrecision can produce trailing zeros or scientific notation;
  // parseFloat cleans those up.
  return parseFloat(n.toPrecision(12));
}

/**
 * Calculator state machine.
 *
 * State fields:
 *   display  {string}  what to show the user
 *   pending  {number|null}  left-hand operand waiting for rhs
 *   operator {string|null}  +, -, *, /
 *   fresh    {boolean}  next digit press starts a new number
 *   error    {boolean}  divide-by-zero (or similar) occurred
 */
function createCalc() {
  return { display: '0', pending: null, operator: null, fresh: false, error: false };
}

/**
 * Return a new state after the user presses a digit or decimal point.
 * @param {object} s  current state
 * @param {string} ch digit '0'-'9' or '.'
 */
function pressDigit(s, ch) {
  if (s.error) return s; // ignore input while error is showing
  let display;
  if (s.fresh || s.display === '0') {
    // starting a new number
    display = ch === '.' ? '0.' : ch;
  } else {
    if (s.display.length >= MAX_DIGITS) return s; // cap length
    if (ch === '.' && s.display.includes('.')) return s; // one decimal only
    display = s.display + ch;
  }
  return { ...s, display, fresh: false };
}

/**
 * Apply the pending operator to (pending, rhs) and return result string.
 * Returns null if there is no pending operator.
 */
function applyOperator(pending, operator, rhs) {
  if (operator === null || pending === null) return rhs;
  switch (operator) {
    case '+': return roundResult(pending + rhs);
    case '-': return roundResult(pending - rhs);
    case '*': return roundResult(pending * rhs);
    case '/': {
      if (rhs === 0) return 'Error';
      return roundResult(pending / rhs);
    }
    default: return rhs;
  }
}

/**
 * Return a new state after the user presses an operator (+, -, *, /).
 * AC5: pressing an operator after a result chains the calculation.
 * AC6: 1 + 2 + 3 evaluates left-to-right.
 */
function pressOperator(s, op) {
  if (s.error) return s;
  const rhs = parseFloat(s.display);
  const result = applyOperator(s.pending, s.operator, rhs);
  const resultNum = typeof result === 'number' ? result : parseFloat(String(result));
  return {
    display: String(result),
    pending: resultNum,
    operator: op,
    fresh: true,
    error: false,
  };
}

/**
 * Return a new state after the user presses = (or Enter).
 * AC2, AC4, AC5.
 */
function pressEquals(s) {
  if (s.error) return s;
  if (s.operator === null) return { ...s, fresh: true }; // nothing to compute
  const rhs = parseFloat(s.display);
  const result = applyOperator(s.pending, s.operator, rhs);
  if (result === 'Error') {
    return { display: 'Error', pending: null, operator: null, fresh: true, error: true };
  }
  return {
    display: String(result),
    pending: result,
    operator: null,
    fresh: true,
    error: false,
  };
}

/**
 * Return a fresh state (C button / Escape key).
 * AC7, AC14.
 */
function pressClear() {
  return createCalc();
}

if (typeof module !== 'undefined') {
  module.exports = {
    createCalc,
    pressDigit,
    pressOperator,
    pressEquals,
    pressClear,
    roundResult,
    applyOperator,
  };
}
