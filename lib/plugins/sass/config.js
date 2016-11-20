'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultConfig(buildSystemConfig) {

  const config = buildSystemConfig;

  config.paths.source = `${path.resolve(buildSystemConfig.paths.root, buildSystemConfig.paths.source)}/**/*.s+(a|c)ss`;

  const sasslintConfigPath = path.resolve(buildSystemConfig.paths.root, 'scss-lint.yml');
  const sasslintConfigExists = fs.existsSync(sasslintConfigPath);
  if (sasslintConfigExists) {
    config.paths.sasslintConfig = sasslintConfigPath;
  } else {
    config.paths.sasslintConfig = undefined;
  }

  config.backupSetupFiles = buildSystemConfig.backupSetupFiles || true;

  return config;
}

module.exports = getDefaultConfig;
