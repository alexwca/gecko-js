'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

const copy = (name) => {
  const srcPath = path.join(SRC, name);
  const distPath = path.join(DIST, name);
  if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, distPath);
};

['utils.js', 'obfuscate.js', 'index.js', 'webpack-plugin.js'].forEach(copy);

// ESM entry points (re-export CJS for "module" field)
fs.writeFileSync(
  path.join(DIST, 'index.mjs'),
  "import { obfuscate } from './obfuscate.js';\nexport { obfuscate };\nexport default obfuscate;\n"
);
fs.writeFileSync(
  path.join(DIST, 'webpack-plugin.mjs'),
  "import GeckoObfuscatorPlugin from './webpack-plugin.js';\nexport default GeckoObfuscatorPlugin;\nexport { GeckoObfuscatorPlugin };\n"
);

console.log('Build concluído: dist/');
