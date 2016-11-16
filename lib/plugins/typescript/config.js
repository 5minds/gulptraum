'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultConfig(buildSystemConfig) {

  const config = {
    paths: {},
  };

  config.paths.root = buildSystemConfig.paths.root || '.';
  config.paths.source = `${path.resolve(buildSystemConfig.paths.root, buildSystemConfig.paths.source)}/**/*.ts`;
  config.paths.typings = `${path.resolve(buildSystemConfig.paths.root, 'typings/')}/**/*.d.ts`;
  config.paths.output = buildSystemConfig.paths.output;
  config.paths.doc = buildSystemConfig.paths.doc;
  config.paths.tests = buildSystemConfig.paths.tests;
  config.paths.testOutput = buildSystemConfig.paths.testOutput;
  config.paths.excludes = buildSystemConfig.paths.excludes || [];

  const tslintConfigPath = path.resolve(buildSystemConfig.paths.root, 'tslint.json');
  const tslintConfigExists = fs.existsSync(tslintConfigPath);
  if (tslintConfigExists) {
    config.paths.tslintConfig = tslintConfigPath;
  } else {
    config.paths.tslintConfig = undefined;
  }

  config.useTypeScriptForDTS = true;
  config.packageName = buildSystemConfig.packageName || '';
  config.sort = buildSystemConfig.sort || false;
  config.importsToAdd = [];
  config.compileToModules = ['es2015', 'commonjs', 'amd', 'system'];

  return config;
}

module.exports = getDefaultConfig;
