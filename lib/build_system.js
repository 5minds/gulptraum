'use strict';

const merge = require('deepmerge');
const runSequence = require('run-sequence');
const groupBy = require('lodash.groupby');
const flatten = require('lodash.flatten');
const defaultBuildSystemConfig = require('./build_system_default_config.json');
const systemTasks = require('./tasks');
const exec = require('child_process').exec;

const yargs = require('yargs');
const vorpal = require('vorpal');
const clone = require('clone');

class BuildSystem {

  constructor(config) {
    this._pluginConfigs = {};
    this._plugins = {};

    this.config = config;

    this.initialize();
  }

  get config() {
    if (!this._config) {
      return {};
    }
    return this._config;
  }

  set config(value) {
    this._validateBuildSystemConfig(value);
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

  get tasks() {
    return Object.keys(this.gulp.tasks);
  }

  get cli() {
    return this._cli;
  }

  set cli(value) {
    this._cli = value;
  }

  initialize() {
    this.cli = vorpal();
  }

  _validateBuildSystemConfig(config) {
    if (!config.packageName) {
      throw new Error('packageName is required.');
    }
  }

  registerTasks(externalGulp) {

    this.config = this._mergeConfigs(defaultBuildSystemConfig, this.config);

    this._gulp = externalGulp || require('gulp'); //eslint-disable-line

    this._registerTasksBeforePlugins();

    this._initializePlugins();

    this._registerTasksAfterPlugins();

    this._registerSystemTasks();
  }

  isTaskRegistered(taskName) {
    return this.tasks.indexOf(taskName) >= 0;
  }

  _registerSystemTasks() {

    const systemTasks = this._getSystemTasks();

    systemTasks.forEach((systemTask) => {
      this._registerSystemTask(systemTask);
    });
  }

  _registerSystemTask(taskName) {
    const task = this._getSystemTask(taskName);

    if (!task.excludeTaskFromCli) {
      this._registerTaskToCli(task.name, task.help);
    }

    task.generate(this.gulp, this.config, this);
  }

  _getSystemTasks() {
    return Object.keys(systemTasks);
  }

  _getSystemTask(taskName) {
    return systemTasks[taskName];
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
    plugin.initializePlugin(this.gulp, configUsed, this);
  }

  _registerTasksBeforePlugins() {

  }

  _registerTasksAfterPlugins() {
    this._registerConventionalTasks();
  }

  _registerConventionalTasks() {
    const conventionalTasks = Object.keys(this.config.conventional_tasks);

    conventionalTasks.forEach((conventionalTask) => {
      this._registerConventionalTask(conventionalTask);
    });
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

    const tasks = tasksInRunningOrder.map((pluginKey) => {

      if (Array.isArray(pluginKey)) {
        // these are only one level deep and are used to differentiate
        // between tasks executed sequentially or in parallel
        return pluginKey.map((subKey) => {
          return this._getTaskNameByConvention(taskName, subKey);
        });
      }

      return this._getTaskNameByConvention(taskName, pluginKey);
    });

    const tasksRegistered = tasks.filter((task) => {
      const isRegistered = this.isTaskRegistered(task);
      return !isRegistered;
    });

    return tasksRegistered;
  }

  task(taskName, config, taskCallback) {

    const help = config.help || 'no help provided';

    this._registerTaskToCli(taskName, help);

    const gulpTaskArgs = [
      taskName,
      taskCallback
    ];

    return this.gulp.task.apply(this.gulp, gulpTaskArgs);
  }

  _registerTaskToCli(taskName, help) {

    this.cli.command(taskName, help)
      .action((args, callback) => {
        return this._runTaskFromCli(taskName, args, callback);
      });
  }

  _ensureTaskIsRegisteredToCli(taskName) {
    const isTaskRegisteredToCli = this.cli.find(taskName);

    if (!isTaskRegisteredToCli) {
      throw new Error('Task "${taskName}" is not registered.');
    }
  }

  _runTaskFromCli(taskName, args, callback) {

    const optionKeys = Object.keys(args.options);

    const optionStrings = optionKeys.map((optionKey) => {
      const optionValue = args.options[optionKey];
      return `--${optionKey} ${optionValue}`;
    });

    if (optionKeys.length === 0) {
      return this._runCommandInChildProcess(`gulp ${taskName}`, callback);
    }

    const gulpCommand = ['gulp', taskName].concat(optionStrings)
      .join(' ')
      .trim();

    this._runCommandInChildProcess(gulpCommand, callback);
  }

  _runCommandInChildProcess(command, callback) {

    const commandCallback = (error, stdout, stderr) => {
      console.log(stdout);
      callback();
    }

    const execOptions = {
      shell: true,
    };

    exec(command, execOptions, commandCallback);
  }

  _registerConventionalTaskToCli(taskName) {

    const help = this._getHelpForConventionalTask(taskName);

    this._registerTaskToCli(taskName, help);
  }

  _registerConventionalTask(taskName) {

    this._registerConventionalTaskToCli(taskName);

    const taskConfig = this._getConventionalTaskConfig(taskName);
    const buildTasks = this._getBuildTasksForConventionalTask(taskName);

    const taskChain = taskConfig.dependencies || [];
    Array.prototype.push.apply(taskChain, buildTasks);

    this.gulp.task(`${taskName}`, (callback) => {

      if (taskChain.length <= 0) {

        this._handleEmptySequence(taskName);

        return callback();
      }

      const finishSequenceHandler = (error) => {
        return this._handleRunSequenceError(error, callback);
      };
      taskChain.push(finishSequenceHandler);

      const runSequenceWithGulp = runSequence.use(this.gulp);

      return runSequenceWithGulp.apply(undefined, taskChain);
    });
  }

  _getConventionalTaskConfig(taskName) {
    return this.config.conventional_tasks[taskName];
  }

  _getHelpForConventionalTask(taskName) {

    const taskConfig = this._getConventionalTaskConfig(taskName);

    if (!taskConfig) {
      return 'help not found';
    }

    return this.config.conventional_tasks[taskName].help;
  }

  _handleEmptySequence(taskName) {
    console.log(`No sub tasks found for top level task "${taskName}".`);
  }

  _handleRunSequenceError(error, callback) {

    if (this.config.suppressErrors) {
      return callback();
    }

    //if any error happened in the previous tasks, exit with a code > 0
    if (error) {

      const exitCode = 2;

      console.log('[ERROR] gulp build task failed', error);
      console.log('[FAIL] gulp build task failed - exiting with code ' + exitCode);

      return process.exit(exitCode);

    } else {
      return callback();
    }
  }

  _getPluginKeysGroupedByPriority() {

    const allPluginKeys = this._getPluginKeys();

    const groupedPluginKeys = groupBy(allPluginKeys, (key) => {

      const config = this._getPluginConfig(key);

      return config.priority;
    });

    return groupedPluginKeys;
  }

  _getPluginKeys() {
    return Object.keys(this.pluginConfigs);
  }

  _getPlugin(name) {
    return this.plugins[name];
  }

  _getPluginConfig(name) {
    return this.pluginConfigs[name];
  }

  _getPluginDefaultConfig(name) {

    if (!this.plugins[name]) {
      throw new Error(`Default configuration for plugin "${name}" is missing.`);
    }

    const config = clone(this.config);

    return this.plugins[name].getDefaultConfig(config);
  }

  _getResolvedPluginConfig(name) {

    const pluginConfig = this._getPluginConfig(name);
    const pluginDefaultConfig = this._getPluginDefaultConfig(name);

    const resolvedConfig = this._mergeConfigs(pluginDefaultConfig, pluginConfig);

    return resolvedConfig;
  }

  _getPluginKeysOrderedByPriority() {

    const allPluginKeys = this._getPluginKeys();

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
