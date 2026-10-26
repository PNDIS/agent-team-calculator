'use strict';

// Calculator state
let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecond = false;
let errorState = false;

function getDisplay() {
  return displayValue;
}

function reset() {
  displayValue = '0';
  firstOperand = null;
  operator = null;
  waitingForSecond = false;
  errorState = false;
}

// Format a number to avoid floating-point noise, up to 10 significant digits
function formatNumber(n) {
  if (!isFinite(n)) return 'Error';
  // Use toPrecision to round, then strip trailing zeros
  let s = parseFloat(n.toPrecision(10)).toString();
  return s;
}

function inputDigit(digit) {
  // If in error state, a new digit starts fresh
  if (errorState) {
    reset();
  }
  if (waitingForSecond) {
    displayValue = String(digit);
    waitingForSecond = false;
  } else {
    displayValue = displayValue === '0' ? String(digit) : displayValue + digit;
  }
}

function inputDecimal() {
  if (errorState) {
    reset();
    displayValue = '0.';
    return;
  }
  if (waitingForSecond) {
    displayValue = '0.';
    waitingForSecond = false;
    return;
  }
  if (!displayValue.includes('.')) {
    displayValue += '.';
  }
}

function handleOperator(op) {
  if (errorState) return;

  const current = parseFloat(displayValue);

  // If we already have an operator and are NOT waiting for second operand,
  // compute the running result first (chaining)
  if (operator !== null && !waitingForSecond) {
    const result = compute(firstOperand, current, operator);
    if (result === null) {
      displayValue = "Can't divide by zero";
      errorState = true;
      firstOperand = null;
      operator = null;
      waitingForSecond = false;
      return;
    }
    firstOperand = result;
    displayValue = formatNumber(result);
  } else {
    firstOperand = current;
  }

  operator = op;
  waitingForSecond = true;
}

function compute(a, b, op) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) return null;
      return a / b;
    default:
      return b;
  }
}

function handleEquals() {
  if (errorState) return;
  if (operator === null) return;

  const current = parseFloat(displayValue);
  const result = compute(firstOperand, current, operator);

  if (result === null) {
    displayValue = "Can't divide by zero";
    errorState = true;
    firstOperand = null;
    operator = null;
    waitingForSecond = false;
    return;
  }

  displayValue = formatNumber(result);
  // After equals, result becomes firstOperand for chaining (AC5)
  firstOperand = result;
  operator = null;
  waitingForSecond = true;
}

function handleClear() {
  reset();
}

if (typeof module !== 'undefined') {
  module.exports = {
    getDisplay,
    reset,
    inputDigit,
    inputDecimal,
    handleOperator,
    handleEquals,
    handleClear,
    formatNumber,
    compute,
  };
}
