'use strict';

const tasks = require('./tasks');
const GetDefaultTypeScriptConfig = require('./config');

function initializePlugin(gulp, config, gulptraum) {
  tasks.initializePluginTasks(gulp, config, gulptraum);
}

// This is the interface plugins have to provide
module.exports = {
  initializePlugin: initializePlugin,
  getDefaultConfig: GetDefaultTypeScriptConfig,
};
