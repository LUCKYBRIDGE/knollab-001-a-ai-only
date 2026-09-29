const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const shell = require('./shell.js');

test('direct version links accept only available versions and default to v3', () => {
  assert.equal(shell.getVersion('?version=1'), 1);
  assert.equal(shell.getVersion('?version=2'), 2);
  assert.equal(shell.getVersion('?version=3'), 3);
  assert.equal(shell.getVersion(''), 3);
  assert.equal(shell.getVersion('?version=4'), 3);
  assert.equal(shell.getVersion('?version=%2e%2e'), 3);
});

test('experiment links retain the version except for D', () => {
  assert.equal(shell.getExperimentUrl('b-design-md', 2), 'https://luckybridge.github.io/knollab-001-b-design-md/?version=2');
  assert.equal(shell.getExperimentUrl('d-design-figma-mcp-actively', 3), 'https://luckybridge.github.io/knollab-001-d-design-figma-mcp-actively/?version=1');
});

test('every iframe target has an original page with local assets', () => {
  for (const version of [1, 2, 3]) {
    const folder = path.join(__dirname, 'versions', `v${version}`);
    const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
    for (const [, asset] of html.matchAll(/(?:src|href)="(?!https?:|#|data:)([^"]+)"/g)) {
      assert.ok(fs.existsSync(path.join(folder, asset)), `v${version}: missing ${asset}`);
    }
  }
});
