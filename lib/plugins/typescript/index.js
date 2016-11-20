'use strict';

const clean = require('./clean');
const build = require('./build');
const test = require('./test');
const doc = require('./doc');
const lint = require('./lint');
const setupDev = require('./setup_dev');
const GetDefaultTypeScriptConfig = require('./config');

function initializePlugin(gulp, config, gulptraum) {
  clean.generate(gulp, config, gulptraum);
  build.generate(gulp, config, gulptraum);
  test.generate(gulp, config, gulptraum);
  doc.generate(gulp, config, gulptraum);
  lint.generate(gulp, config, gulptraum);
  setupDev.generate(gulp, config, gulptraum);
}

// This is the interface plugins have to provide
module.exports = {
  initializePlugin: initializePlugin,
  getDefaultConfig: GetDefaultTypeScriptConfig,
};
