'use strict';

/** Nomes reservados que não podem ser renomeados (quebram o runtime) */
const RESERVED = new Set([
  'undefined', 'null', 'true', 'false', 'NaN', 'Infinity',
  'eval', 'arguments', 'this', 'super', 'console', 'window', 'document', 'globalThis',
  'exports', 'module', 'require', 'define', '__esModule', 'default',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Symbol', 'BigInt',
  'Math', 'JSON', 'Promise', 'RegExp', 'Date', 'Error', 'Map', 'Set', 'WeakMap', 'WeakSet',
  'Proxy', 'Reflect', 'Intl', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
  'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array',
  'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'isNaN', 'isFinite',
  'parseFloat', 'parseInt', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'fetch', 'atob', 'btoa', 'getComputedStyle', 'querySelector', 'querySelectorAll',
  'addEventListener', 'removeEventListener', 'dispatchEvent'
]);

/**
 * Gera identificadores únicos (hex ou mangled)
 */
function createNameGenerator(mode = 'hexadecimal') {
  const used = new Set();
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16);
  const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let counter = 0;
  const nextMangled = () => {
    let s = '';
    let n = counter++;
    do {
      s = alpha[n % 52] + s;
      n = Math.floor(n / 52) - 1;
    } while (n >= 0);
    return s;
  };
  return function next() {
    let name;
    do {
      name = mode === 'hexadecimal' ? '_0x' + hex() + hex() : '_' + nextMangled();
    } while (used.has(name) || /^[0-9]/.test(name));
    used.add(name);
    return name;
  };
}

/** Gera um número "seguro" para XOR de strings (1-255) */
function randomByte() {
  return Math.floor(Math.random() * 254) + 1;
}

module.exports = { RESERVED, createNameGenerator, randomByte };
