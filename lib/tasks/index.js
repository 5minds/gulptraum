'use strict';

const prepareRelease = require('./prepare_release');
const systemTasks = require('./system_tasks');

module.exports = {
  prepareRelease: prepareRelease,
  system: systemTasks,
};
