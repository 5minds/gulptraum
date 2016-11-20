'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultConfig(buildSystemConfig) {

  const config = {
    paths: {},
  };

  config.paths.root = buildSystemConfig.paths.root || '.';
  config.paths.source = `${path.resolve(buildSystemConfig.paths.root, buildSystemConfig.paths.source)}/**/*.s+(a|c)ss`;
  config.paths.output = buildSystemConfig.paths.output;
  config.paths.doc = buildSystemConfig.paths.doc;
  config.paths.setup = buildSystemConfig.paths.setup || '.';

  const sasslintConfigPath = path.resolve(buildSystemConfig.paths.root, 'scss-lint.yml');
  const sasslintConfigExists = fs.existsSync(sasslintConfigPath);
  if (sasslintConfigExists) {
    config.paths.sasslintConfig = sasslintConfigPath;
  } else {
    config.paths.sasslintConfig = undefined;
  }

  config.backupSetupFiles = buildSystemConfig.backupSetupFiles || true;
  config.packageName = buildSystemConfig.packageName;

  return config;
}

module.exports = getDefaultConfig;
