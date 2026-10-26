'use strict';

/**
 * Calculator state and logic for PND-276.
 * Exported for both the page (via <script>) and node tests.
 */

const ERR_DIV_ZERO = "Can't divide by zero";

/**
 * Round to at most 12 significant digits so that 0.1+0.2 => 0.3.
 * Returns the number unchanged if it is not finite.
 */
function roundResult(n) {
  if (!isFinite(n)) return n;
  // toPrecision produces a string; parseFloat trims trailing zeros
  return parseFloat(n.toPrecision(12));
}

/**
 * Apply an arithmetic operator to two operands.
 * Returns a number or the ERR_DIV_ZERO string.
 */
function applyOperator(a, op, b) {
  switch (op) {
    case '+': return roundResult(a + b);
    case '-': return roundResult(a - b);
    case '*': return roundResult(a * b);
    case '/': {
      if (b === 0) return ERR_DIV_ZERO;
      return roundResult(a / b);
    }
    default: return b;
  }
}

/**
 * Format a number for display.
 * Truncates very long strings to 12 significant digits.
 */
function formatDisplay(value) {
  if (typeof value === 'string') return value; // error message
  const s = String(value);
  // if the representation is already short, use it
  if (s.replace('-', '').replace('.', '').length <= 12) return s;
  // otherwise round to 12 sig figs
  return String(parseFloat(value.toPrecision(12)));
}

/**
 * Immutable calculator state.
 * { display: string, pending: number|null, operator: string|null, waitingForOperand: bool, error: bool }
 */
function initialState() {
  return { display: '0', pending: null, operator: null, waitingForOperand: false, error: false };
}

/**
 * Handle a digit character ('0'–'9') or decimal point ('.').
 */
function inputDigit(state, digit) {
  if (state.error || state.waitingForOperand) {
    // start fresh unless error (error clears on digit too)
    return { ...initialState(), display: digit === '.' ? '0.' : digit, waitingForOperand: false };
  }
  if (digit === '.') {
    if (state.display.includes('.')) return state; // already has decimal
    return { ...state, display: state.display + '.' };
  }
  const newDisplay = state.display === '0' ? digit : state.display + digit;
  return { ...state, display: newDisplay };
}

/**
 * Handle an operator character ('+', '-', '*', '/').
 */
function inputOperator(state, op) {
  if (state.error) return state; // ignore operator when in error

  const current = parseFloat(state.display);

  // chain: if we already have a pending operator apply it first
  if (state.operator !== null && !state.waitingForOperand) {
    const result = applyOperator(state.pending, state.operator, current);
    if (result === ERR_DIV_ZERO) {
      return { ...initialState(), display: ERR_DIV_ZERO, error: true };
    }
    return { display: formatDisplay(result), pending: result, operator: op, waitingForOperand: true, error: false };
  }

  return { display: formatDisplay(current), pending: current, operator: op, waitingForOperand: true, error: false };
}

/**
 * Handle equals ('=').
 */
function inputEquals(state) {
  if (state.error) return state;
  if (state.operator === null) return state; // nothing to compute

  const current = parseFloat(state.display);
  const result = applyOperator(state.pending, state.operator, current);

  if (result === ERR_DIV_ZERO) {
    return { ...initialState(), display: ERR_DIV_ZERO, error: true };
  }

  return { display: formatDisplay(result), pending: null, operator: null, waitingForOperand: true, error: false };
}

/**
 * Handle clear ('C' or Escape).
 */
function inputClear() {
  return initialState();
}

if (typeof module !== 'undefined') {
  module.exports = {
    ERR_DIV_ZERO,
    roundResult,
    applyOperator,
    formatDisplay,
    initialState,
    inputDigit,
    inputOperator,
    inputEquals,
    inputClear,
  };
}
