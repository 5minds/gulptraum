'use strict';

const clean = require('./clean');
const build = require('./build');
const test = require('./test');
const GetDefaultTypeScriptConfig = require('./config');

function initializePlugin(gulp, config) {
  clean.generate(gulp, config);
  build.generate(gulp, config);
  test.generate(gulp, config);
}

// This is the interface build steps have to provide
module.exports = {
  initializePlugin: initializePlugin,
  getDefaultConfig: GetDefaultTypeScriptConfig,
};