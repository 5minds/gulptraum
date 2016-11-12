'use strict';

const merge = require('deepmerge');
const runSequence = require('run-sequence');
const groupBy = require('lodash.groupby');
const flatten = require('lodash.flatten');
const defaultBuildSystemConfig = require('./default_config.json');

class BuildSystem {

  constructor(config) {
    this._pluginConfigs = {};
    this._plugins = {};

    this._config = config;
  }

  get config() {
    if (!this._config) {
      return {};
    }
    return this._config;
  }

  set config(value) {
    this._config = value;
  }

  get plugins() {
    return this._plugins;
  }

  get pluginConfigs() {
    return this._pluginConfigs;
  }

  get gulp() {
    return this._gulp;
  }

  registerTasks(externalGulp) {

    this.config = this._mergeConfigs(defaultBuildSystemConfig, this.config);

    this._gulp = externalGulp || require('gulp'); //eslint-disable-line

    this._registerTasksBeforeSteps();

    this._initializePlugins();

    this._registerTasksAfterSteps();
  }

  _initializePlugins() {

    const pluginsToInitialize = this._getPluginKeysOrderedByPriority();

    pluginsToInitialize.forEach((plugin) => {

      this._initializePlugin(plugin);
    });
  }

  _initializePlugin(name) {
    const plugin = this._getPlugin(name);
    const configUsed = this._getResolvedPluginConfig(name);
    plugin.initializePlugin(this.gulp, configUsed);
  }

  _registerTasksBeforeSteps() {

  }

  _registerTasksAfterSteps() {
    this._registerConventionalTask('clean');
    this._registerConventionalTask('build', ['clean']);
    this._registerConventionalTask('test', ['build']);
  }

  _getTasksInRunningOrder(pluginKeys) {

    const pluginKeysGroupedByPriority = this._getPluginKeysGroupedByPriority();

    const groupKeys = Object.keys(pluginKeysGroupedByPriority);

    const groupKeysSorted = groupKeys.sort((a, b) => {
      return b - a;
    });

    const allTasks = [];

    groupKeysSorted.forEach((key) => {

      const tasks = pluginKeysGroupedByPriority[key];

      allTasks.push(tasks);
    });

    return allTasks;
  }

  _getTaskNameByConvention(taskName, pluginKey) {
    return `${taskName}-${pluginKey}`;
  }

  _getBuildTasksForConventionalTask(taskName) {

    const pluginKeys = this._getPluginKeysOrderedByPriority();

    const tasksInRunningOrder = this._getTasksInRunningOrder(pluginKeys);

    const buildTasks = tasksInRunningOrder.map((pluginKey) => {

      if (Array.isArray(pluginKey)) {
        // these are only one level deep and are used to differentiate
        // between tasks executed sequentially or in parallel
        return pluginKey.map((subKey) => {
          return this._getTaskNameByConvention(taskName, subKey);
        });
      }

      return this._getTaskNameByConvention(taskName, pluginKey);
    });

    return buildTasks;
  }

  _registerConventionalTask(taskName, tasksBefore, tasksAfter) {

    const buildTasks = this._getBuildTasksForConventionalTask(taskName);

    const runSequenceWithGulp = runSequence.use(this.gulp);

    const taskChain = [];

    if (Array.isArray(tasksBefore)) {
      Array.prototype.push.apply(taskChain, tasksBefore);
    }

    Array.prototype.push.apply(taskChain, buildTasks);

    if (Array.isArray(tasksAfter)) {
      Array.prototype.push.apply(taskChain, tasksAfter);
    }

    this.gulp.task(`${taskName}`, (callback) => {
      taskChain.push(callback);
      runSequenceWithGulp.apply(undefined, taskChain);
    });
  }

  _getPluginKeysGroupedByPriority() {

    const allPluginKeys = this.getPluginKeys();

    const groupedPluginKeys = groupBy(allPluginKeys, (key) => {

      const config = this._getPluginConfig(key);

      return config.priority;
    });

    return groupedPluginKeys;
  }

  getPluginKeys() {
    return Object.keys(this.pluginConfigs);
  }

  _getPlugin(name) {
    return this.plugins[name];
  }

  _getPluginConfig(name) {
    return this.pluginConfigs[name];
  }

  _getPluginDefaultConfig(name) {
    return this.plugins[name].getDefaultConfig(this.config);
  }

  _getResolvedPluginConfig(name) {
    const pluginConfig = this._getPluginConfig(name);
    const pluginDefaultConfig = this._getPluginDefaultConfig(name);

    const resolvedConfig = this._mergeConfigs(pluginDefaultConfig, pluginConfig);

    return resolvedConfig;
  }

  _getPluginKeysOrderedByPriority() {

    const allPluginKeys = this.getPluginKeys();

    const sortedPluginKeys = allPluginKeys.sort((a, b) => {

      const pluginAConfig = this._getPluginConfig(a);
      const pluginBConfig = this._getPluginConfig(b);

      return pluginBConfig.priority - pluginAConfig.priority;
    });

    return sortedPluginKeys;
  }

  _mergeConfigs(defaultConfig, config) {
    return merge(defaultConfig, config);
  }

  registerPlugin(name, plugin, config, priority) {

    this.plugins[name] = plugin;

    this.pluginConfigs[name] = config;
    this.pluginConfigs[name].priority = priority || 10;

    return this;
  }

}

module.exports = BuildSystem;