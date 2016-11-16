'use strict';

const path = require('path');

function getDefaultConfig(buildSystemConfig) {

  const config = {
    paths: {},
  };

  config.paths.root = buildSystemConfig.paths.root || '.';
  config.paths.source = `${path.resolve(buildSystemConfig.paths.root, buildSystemConfig.paths.source)}/**/*.s+(a|c)ss`;
  config.paths.output = buildSystemConfig.paths.output;
  config.paths.doc = buildSystemConfig.paths.doc;
  config.paths.sasslintConfig = path.resolve(buildSystemConfig.paths.root, 'scss-lint.yml') || '';

  config.packageName = buildSystemConfig.packageName || '';

  return config;
}

module.exports = getDefaultConfig;
