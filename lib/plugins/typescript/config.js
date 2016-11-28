'use strict';

const fs = require('fs');
const path = require('path');
const clone = require('clone');

function getDefaultConfig(buildSystemConfig) {

  const config = buildSystemConfig;

  config.paths.source = `${path.resolve(buildSystemConfig.paths.root, buildSystemConfig.paths.source)}/**/*.ts`;
  config.paths.typings = `${path.resolve(buildSystemConfig.paths.root, 'typings/')}/**/*.d.ts`;

  const tslintConfigPath = path.resolve(buildSystemConfig.paths.root, 'tslint.json');
  const tslintConfigExists = fs.existsSync(tslintConfigPath);
  if (tslintConfigExists) {
    config.paths.tslintConfig = tslintConfigPath;
  } else {
    config.paths.tslintConfig = undefined;
  }

  config.backupSetupFiles = buildSystemConfig.backupSetupFiles || true;
  config.useTypeScriptForDTS = true;
  config.sort = buildSystemConfig.sort || false;
  config.importsToAdd = [];
  config.compileToModules = buildSystemConfig.compileToModules || ['es2015', 'commonjs', 'amd', 'system'];

  return config;
}

module.exports = getDefaultConfig;
