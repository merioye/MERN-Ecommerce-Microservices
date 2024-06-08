const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const next = path.resolve(root, '.next');
const nodeModules = path.resolve(root, 'node_modules');
const turbo = path.resolve(root, '.turbo');

[next, nodeModules, turbo].forEach((dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
