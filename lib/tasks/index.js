'use strict';

const gulptraum = require('./gulptraum');
const help = require('./help');
const prepareRelease = require('./prepare_release');
const release = require('./release');
const tasks = require('./tasks');

module.exports = {
  gulptraum: gulptraum,
  help: help,
  prepareRelease: prepareRelease,
  release: release,
  tasks: tasks,
};
