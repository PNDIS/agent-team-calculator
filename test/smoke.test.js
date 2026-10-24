'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('index.html exists', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'index.html')));
});
