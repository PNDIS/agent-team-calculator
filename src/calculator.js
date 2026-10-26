'use strict';

// ── state ──────────────────────────────────────────────────────────────────
let displayValue     = '0';   // what the display shows
let storedValue      = null;  // left-hand operand
let pendingOp        = null;  // pending operator string
let justEvalled      = false; // true right after pressing =
let isError          = false; // true while showing Error
let startingNewInput = true;  // true when next digit should start a fresh number

// ── helpers ────────────────────────────────────────────────────────────────
/**
 * Round a number to at most 12 significant digits to kill floating-point
 * noise (e.g. 0.1 + 0.2 → 0.3).  Then convert to string, preferring
 * exponential notation for very large / very small magnitudes.
 */
function formatResult(n) {
  if (!isFinite(n)) return 'Error';
  // toPrecision(12) kills floating-point noise; parseFloat strips trailing zeros
  let s = parseFloat(n.toPrecision(12)).toString();
  // If the string is very long (>12 chars not counting sign / decimal),
  // switch to exponential notation with fewer digits
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

// ── public API ─────────────────────────────────────────────────────────────

/** Return what the display should show right now. */
function getDisplay() { return displayValue; }

/**
 * Handle a digit (0–9) or decimal point press.
 * @param {string} ch  '0'–'9' or '.'
 */
function pressDigit(ch) {
  if (isError) return;

  // After = or after pressing an operator, the next digit starts a brand-new number
  if (justEvalled || startingNewInput) {
    displayValue     = '0';
    justEvalled      = false;
    startingNewInput = false;
    // When coming from =, also clear the stored chain so pressing a digit
    // after = truly starts fresh (AC5: pressing an operator after = is
    // handled in pressOperator, not here)
    if (justEvalled) {
      storedValue = null;
      pendingOp   = null;
    }
  }

  if (ch === '.') {
    if (!displayValue.includes('.')) displayValue += '.';
    return;
  }
  if (displayValue === '0') {
    displayValue = ch;
  } else {
    displayValue += ch;
  }
}

/**
 * Handle an operator press: +, -, *, /
 * @param {string} op
 */
function pressOperator(op) {
  if (isError) return;
  const current = parseFloat(displayValue);
  if (pendingOp !== null && !justEvalled && !startingNewInput) {
    // Chain: compute the pending operation first (left-to-right, no precedence)
    const result = applyOp(pendingOp, storedValue, current);
    if (!isFinite(result)) {
      displayValue     = 'Error';
      isError          = true;
      pendingOp        = null;
      storedValue      = null;
      startingNewInput = false;
      return;
    }
    storedValue  = result;
    displayValue = formatResult(result);
  } else {
    storedValue = current;
  }
  pendingOp        = op;
  justEvalled      = false;
  startingNewInput = true;  // next digit starts the right-hand operand
}

/**
 * Handle the = button.
 */
function pressEquals() {
  if (isError) return;
  if (pendingOp === null) return;
  const current = parseFloat(displayValue);
  const result  = applyOp(pendingOp, storedValue, current);
  if (!isFinite(result)) {
    displayValue     = 'Error';
    isError          = true;
    pendingOp        = null;
    storedValue      = null;
    startingNewInput = false;
    return;
  }
  displayValue     = formatResult(result);
  storedValue      = parseFloat(displayValue); // keep result for AC5 chain
  pendingOp        = null;
  justEvalled      = true;
  startingNewInput = false;
}

/**
 * Handle the C (clear) button.
 */
function pressClear() {
  displayValue     = '0';
  storedValue      = null;
  pendingOp        = null;
  justEvalled      = false;
  isError          = false;
  startingNewInput = true;
}

// ── module export (for node --test) ────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { getDisplay, pressDigit, pressOperator, pressEquals, pressClear, formatResult };
}
