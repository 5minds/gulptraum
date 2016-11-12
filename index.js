'use strict';

const BuildSystem = require('./lib/build_system');
const plugins = require('./lib/plugins');

module.exports = {
  BuildSystem: BuildSystem,
  plugins: plugins,
};
