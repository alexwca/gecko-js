'use strict';

/**
 * gecko-js
 * Proteção de código JavaScript: dificulta engenharia reversa e cópia de features.
 * Sem plano Pro, sem banners.
 */

const { obfuscate } = require('./obfuscate');

module.exports = { obfuscate };
module.exports.obfuscate = obfuscate;
