'use strict';

const gulptraum = require('gulptraum');

const buildSystemConfig = {
  packageName: 'gulptraum',
};

const buildSystem = new gulptraum.BuildSystem(buildSystemConfig);

const gulp = require('gulp');

buildSystem
  .registerTasks(gulp);
