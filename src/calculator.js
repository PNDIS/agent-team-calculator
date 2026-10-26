'use strict';

// ── state ──────────────────────────────────────────────────────────────────
let displayValue     = '0';   // what the display shows right now
let storedValue      = null;  // left-hand operand waiting for RHS
let pendingOp        = null;  // pending operator string
let awaitingOperand  = true;  // true  => next digit starts a brand-new number
                              // false => next digit appends to current number
let isError          = false; // true while displaying Error

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Round to at most 12 significant digits to kill floating-point noise
 * (e.g. 0.1 + 0.2 → 0.3), then format as a readable string.
 */
function formatResult(n) {
  if (!isFinite(n)) return 'Error';
  let s = parseFloat(n.toPrecision(12)).toString();
  // If still very long, use exponential with 9 sig-figs
  if (s.replace(/[^0-9]/g, '').length > 12) {
    s = parseFloat(n.toPrecision(9)).toExponential();
  }
  return s;
}

function applyOp(op, a, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default:  return b;
  }
}

function setError() {
  displayValue    = 'Error';
  isError         = true;
  pendingOp       = null;
  storedValue     = null;
  awaitingOperand = false;
}

// ── public API ─────────────────────────────────────────────────────────────

/** Return what the display should show right now. */
function getDisplay() { return displayValue; }

/**
 * Handle a digit (0–9) or decimal point press.
 * @param {string} ch  '0'–'9' or '.'
 */
function pressDigit(ch) {
  if (isError) return;

  if (awaitingOperand) {
    // Start fresh: clear the display
    displayValue    = '0';
    awaitingOperand = false;
  }

  if (ch === '.') {
    if (!displayValue.includes('.')) displayValue += '.';
    return;
  }
  if (displayValue === '0') {
    displayValue = ch;   // replace leading zero
  } else {
    displayValue += ch;  // append
  }
}

/**
 * Handle an operator press: +, -, *, /
 * Sets awaitingOperand so the next digit starts a new number.
 * @param {string} op  '+' | '-' | '*' | '/'
 */
function pressOperator(op) {
  if (isError) return;
  const current = parseFloat(displayValue);
  if (pendingOp !== null && !awaitingOperand) {
    // Chain left-to-right (no precedence) AC4
    const result = applyOp(pendingOp, storedValue, current);
    if (!isFinite(result)) { setError(); return; }
    storedValue  = result;
    displayValue = formatResult(result);
  } else {
    storedValue = current;
  }
  pendingOp       = op;
  awaitingOperand = true; // next digit = RHS of this operator
}

/**
 * Handle the = button.
 */
function pressEquals() {
  if (isError) return;
  if (pendingOp === null) return;
  const current = parseFloat(displayValue);
  const result  = applyOp(pendingOp, storedValue, current);
  if (!isFinite(result)) { setError(); return; }
  displayValue    = formatResult(result);
  storedValue     = parseFloat(displayValue); // retain for AC5 operator-after-=
  pendingOp       = null;
  awaitingOperand = true;  // next digit starts a new number; operator continues
}

/**
 * Handle the C (clear) button.
 */
function pressClear() {
  displayValue    = '0';
  storedValue     = null;
  pendingOp       = null;
  awaitingOperand = true;
  isError         = false;
}

// ── module export (for node --test) ────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { getDisplay, pressDigit, pressOperator, pressEquals, pressClear, formatResult };
}
