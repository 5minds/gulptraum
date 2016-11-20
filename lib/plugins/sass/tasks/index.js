'use strict';

const clean = require('./clean');
const build = require('./build');
const lint = require('./lint');
const setupDev = require('./setup_dev');

function initializePluginTasks(gulp, config, gulptraum) {
  clean.generate(gulp, config, gulptraum);
  build.generate(gulp, config, gulptraum);
  lint.generate(gulp, config, gulptraum);
  setupDev.generate(gulp, config, gulptraum);
}

// This is the interface plugins have to provide
module.exports = {
  initializePluginTasks: initializePluginTasks,
};
