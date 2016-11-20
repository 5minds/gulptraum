'use strict';

const tsconfig = require('./tsconfig.js');
const assign = Object.assign || require('object.assign');
const typescript = require('typescript');

function initializeTypeScriptOptions(buildStepConfig) {

  const resolvedTsConfig = tsconfig.getTypeScriptConfig(buildStepConfig);

  module.exports.getTypeScriptOptions = (override) => {
    return assign(resolvedTsConfig.compilerOptions, {
      target: override && override.target || 'es5',
      typescript: typescript,
    }, override || {});
  };
}

module.exports.initializeTypeScriptOptions = initializeTypeScriptOptions;
