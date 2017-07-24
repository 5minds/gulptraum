'use strict';

const gulptraum = require('@process-engine-js/gulptraum');
const tsconfig = require('tsconfig');

const buildSystemConfig = {
  packageName: 'core'
};

const buildSystem = new gulptraum.BuildSystem(buildSystemConfig);

buildSystem.config = buildSystemConfig;

const typeScriptConfig = {
  compileToModules: ['commonjs'],
};

const gulp = require('gulp');

buildSystem
  .registerPlugin('typescript', gulptraum.plugins.typescript, typeScriptConfig)
  .registerTasks(gulp);
