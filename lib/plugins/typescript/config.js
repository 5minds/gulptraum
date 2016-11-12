'use strict';

const path = require('path');

function getDefaultConfig(buildSystemConfig) {

  const config = {
    paths: {},
  };

  config.paths.root = buildSystemConfig.paths.root || '.';
  config.paths.source = `${path.resolve(buildSystemConfig.paths.root, buildSystemConfig.paths.source)}/**/*.ts`;
  config.paths.typings = `${path.resolve(buildSystemConfig.paths.root, 'typings/')}/**/*.d.ts`;
  config.paths.output = buildSystemConfig.paths.output;
  config.paths.tests = buildSystemConfig.paths.tests;
  config.paths.testOutput = buildSystemConfig.paths.testOutput;
  config.paths.excludes = buildSystemConfig.paths.excludes || [];

  config.useTypeScriptForDTS = true;
  config.packageName = buildSystemConfig.packageName || '';
  config.sort = buildSystemConfig.sort || false;
  config.importsToAdd = [];

  return config;
}

module.exports = getDefaultConfig;
