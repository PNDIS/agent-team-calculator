/* Simple four-function calculator — pure logic, no DOM.
 * Evaluates left-to-right like a basic pocket calculator (no operator precedence).
 */
'use strict';

function initialState() {
  return { display: '0', acc: null, op: null, awaitingOperand: false, error: false };
}

function formatResult(value) {
  if (!Number.isFinite(value)) return 'Error';
  // Round away floating-point noise: 0.1 + 0.2 -> 0.3
  let s = String(parseFloat(value.toPrecision(12)));
  if (s.length > 20) {
    s = value.toExponential(10);
    if (s.length > 20) s = value.toExponential(5);
  }
  return s;
}

function compute(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function pressDigit(state, digit) {
  if (state.error) return state; // owner decision: only C recovers from Error
  const d = String(digit);
  if (!/^[0-9]$/.test(d)) return state;
  if (state.awaitingOperand) {
    return { ...state, display: d, awaitingOperand: false };
  }
  const next = state.display === '0' ? d : state.display + d;
  if (next.replace(/[^0-9]/g, '').length > 15) return state; // ignore absurdly long entry
  return { ...state, display: next };
}

function pressDot(state) {
  if (state.error) return state;
  if (state.awaitingOperand) {
    return { ...state, display: '0.', awaitingOperand: false };
  }
  if (state.display.includes('.')) return state;
  return { ...state, display: state.display + '.' };
}

function pressOperator(state, op) {
  if (state.error) return state;
  if (!['+', '-', '*', '/'].includes(op)) return state;
  const entry = parseFloat(state.display);
  // Chain: if an operation is pending and the user typed a new operand, resolve it first.
  if (state.op !== null && !state.awaitingOperand) {
    const result = compute(state.acc, state.op, entry);
    if (!Number.isFinite(result)) {
      return { display: 'Error', acc: null, op: null, awaitingOperand: true, error: true };
    }
    return { display: formatResult(result), acc: result, op, awaitingOperand: true, error: false };
  }
  const acc = state.op === null ? entry : state.acc; // operator switch before typing an operand
  return { ...state, acc, op, awaitingOperand: true };
}

function pressEquals(state) {
  if (state.error) return state;
  if (state.op === null) return state;
  const b = state.awaitingOperand ? state.acc : parseFloat(state.display);
  const result = compute(state.acc, state.op, b);
  if (!Number.isFinite(result)) {
    return { display: 'Error', acc: null, op: null, awaitingOperand: true, error: true };
  }
  // Result stays in acc so pressing an operator next continues from it (AC5).
  return { display: formatResult(result), acc: result, op: null, awaitingOperand: true, error: false };
}

function pressClear() {
  return initialState();
}

if (typeof module !== 'undefined') {
  module.exports = {
    initialState,
    formatResult,
    compute,
    pressDigit,
    pressDot,
    pressOperator,
    pressEquals,
    pressClear,
  };
}
