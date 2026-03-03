'use strict';

/**
 * Plugin Webpack: aplica ofuscação nos chunks emitidos que batem nos padrões.
 * Compatível com Webpack 4 e 5.
 */

const { obfuscate } = require('./obfuscate');

function matchesPattern(name, patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) return true;
  return patterns.some(p => {
    if (typeof p === 'string') {
      const regex = new RegExp('^' + p.replace(/\*\*/g, '.*').replace(/\*/g, '[^/\\\\]*') + '$');
      return regex.test(name);
    }
    if (p instanceof RegExp) return p.test(name);
    return false;
  });
}

function getRawSource(compilation, code) {
  const webpack = compilation.compiler.webpack;
  if (webpack && webpack.sources && webpack.sources.RawSource) {
    return new webpack.sources.RawSource(code);
  }
  try {
    const RawSource = require('webpack-sources').RawSource;
    return new RawSource(code);
  } catch (_) {
    return { source: () => code, size: () => Buffer.byteLength(code, 'utf8') };
  }
}

class GeckoObfuscatorPlugin {
  /**
   * @param {object} obfuscatorOptions - Opções passadas para obfuscate()
   * @param {string[]} [chunkNames] - Nomes/padrões de chunks a ofuscar (ex: ['main.*.js']). Se vazio, ofusca todos os .js
   */
  constructor(obfuscatorOptions = {}, chunkNames = []) {
    this.options = typeof obfuscatorOptions === 'object' ? obfuscatorOptions : {};
    this.chunkNames = Array.isArray(chunkNames) ? chunkNames : [];
  }

  apply(compiler) {
    const pluginName = 'GeckoObfuscatorPlugin';
    const run = (compilation, callback) => {
      const assets = compilation.assets;
      for (const name of Object.keys(assets)) {
        if (!/\.js$/i.test(name)) continue;
        if (this.chunkNames.length > 0 && !matchesPattern(name, this.chunkNames)) continue;
        const asset = assets[name];
        const raw = asset.source();
        const source = typeof raw === 'string' ? raw : (raw && raw.toString ? raw.toString() : '');
        if (!source) continue;
        try {
          const obfuscated = obfuscate(source, this.options);
          compilation.updateAsset(name, getRawSource(compilation, obfuscated));
        } catch (err) {
          compilation.warnings.push(new Error(pluginName + ': ' + name + ' - ' + err.message));
        }
      }
      if (typeof callback === 'function') callback();
    };

    if (compiler.hooks && compiler.hooks.emit) {
      compiler.hooks.emit.tapAsync(pluginName, run);
    } else {
      compiler.plugin('emit', run);
    }
  }
}

module.exports = GeckoObfuscatorPlugin;
