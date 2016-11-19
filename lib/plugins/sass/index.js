'use strict';

const clean = require('./clean');
const build = require('./build');
const lint = require('./lint');
const setupDev = require('./setup_dev');
const GetDefaultTypeScriptConfig = require('./config');

function initializePlugin(gulp, config) {
  clean.generate(gulp, config);
  build.generate(gulp, config);
  lint.generate(gulp, config);
  setupDev.generate(gulp, config);
}

// This is the interface plugins have to provide
module.exports = {
  initializePlugin: initializePlugin,
  getDefaultConfig: GetDefaultTypeScriptConfig,
};
