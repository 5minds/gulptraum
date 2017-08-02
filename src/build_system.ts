'use strict';

import * as path from 'path';

import * as merge from 'deepmerge';
import * as groupBy from 'lodash.groupby';
import * as flatten from 'lodash.flatten';
import {DefaultBuildSystemConfig} from './index';
import * as tasks from './tasks/index';
import {exec} from 'child_process';

import * as yargs from 'yargs';
import * as vorpal from 'vorpal';
import * as clone from 'clone';

import * as gulp from 'gulp';

import { IPluginConfiguration, IGulptraumPlugin, IGulpVersionAdapter, ITaskConfiguration, ICliTaskArguments, IConventionalTaskConfiguration, IGroupedPluginKeys, IBuildSystem, IBuildSystemConfiguration } from './index';
import {GulpV3Adapter, GulpV4Adapter} from './adapters/index';
import * as systemTasks from './tasks/index';

function mergeArray(destinationArray: Array<any>, sourceArray: Array<any>, mergeOptions) {
  return sourceArray;
}

const mergeOptions = {
  arrayMerge: mergeArray,
};

export class BuildSystem implements IBuildSystem {

  public pluginConfigs: Map<string, IPluginConfiguration> = new Map<string, IPluginConfiguration>();
  public plugins: Map<string, IGulptraumPlugin> = new Map<string, IGulptraumPlugin>();
  public gulpAdapter: IGulpVersionAdapter;
  public gulp: any;
  public config: IBuildSystemConfiguration = {};

  public cli: any;

  constructor(config: IBuildSystemConfiguration) {

    this.config = config;

    this.initialize();
  }

  get tasks() {
    return this.gulpAdapter.getGulpTasks();
  }

  public initialize(): void {
    this.cli = vorpal();
  }

  private _initializeGulpVersionAdapter(): void {
    
    const isVersion3 = typeof Object.getPrototypeOf(this.gulp).run !== 'undefined';
    
    if (isVersion3) {
      this.gulpAdapter = new GulpV3Adapter(this.gulp, this);
    } else {
      this.gulpAdapter = new GulpV4Adapter(this.gulp, this);
    }
  }

  private _validateBuildSystemConfig(config: IBuildSystemConfiguration): void {
    
    if (!config.packageName) {
      
      try {

        const packageManifestPath = path.resolve(`${config.paths.root}/package.json`);
        const packageManifest = require(packageManifestPath);

        if (packageManifest) {

          let name = packageManifest.name;

          if (name[0] == '@') {
            name = name.slice(1);
          }

          config.packageName = name;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  public registerTasks(externalGulp?: any): void {

    this.gulp = externalGulp || gulp; //eslint-disable-line
    
    this._initializeGulpVersionAdapter();

    this.config = this._mergeConfigs(DefaultBuildSystemConfig, this.config);

    this._validateBuildSystemConfig(this.config);

    this._registerTasksBeforePlugins();

    this._initializePlugins();

    this._registerTasksAfterPlugins();

    this._registerSystemTasks();
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
    const conventionalTasks = Object.keys(this.config.conventionalTasks);

    conventionalTasks.forEach((conventionalTask) => {
      this._registerConventionalTask(conventionalTask);
    });
  }

  private _getTasksInRunningOrder(pluginKeys: Array<string>): Array<string> {

    const pluginKeysGroupedByPriority = this._getPluginKeysGroupedByPriority();

    const groupKeys = Object.keys(pluginKeysGroupedByPriority);

    const groupKeysSorted = groupKeys.sort((a: string, b: string) => {
      return +b - +a;
    });

    const allTasks = [];

    groupKeysSorted.forEach((key) => {

      const tasks = pluginKeysGroupedByPriority[key];

      allTasks.push(tasks);
    });

    return allTasks;
  }

  private _getTaskNameByConvention(taskName: string, pluginKey: string): string {
    return `${taskName}-${pluginKey}`;
  }

  private _getBuildTasksForConventionalTask(taskName: string): Array<Array<string>> {

    const pluginKeys = this._getPluginKeysOrderedByPriority();

    const tasksInRunningOrder = this._getTasksInRunningOrder(pluginKeys);

    const topLevelTasks = tasksInRunningOrder.map((pluginKey) => {

      if (Array.isArray(pluginKey)) {
        // these are only one level deep and are used to differentiate
        // between tasks executed sequentially or in parallel
        return pluginKey.map((subKey) => {
          return this._getTaskNameByConvention(taskName, subKey);
        });
      }

      return [this._getTaskNameByConvention(taskName, pluginKey)];
    });

    const tasksRegistered = topLevelTasks.map((subTasks) => {

      return this._filterUnregisteredTasks(subTasks);
    });

    return tasksRegistered;
  }

  private _filterUnregisteredTasks(tasks: Array<string>): Array<string> {

    const tasksRegistered = tasks.filter((task) => {

      return this.gulpAdapter.isTaskRegistered(task);
    });

    return tasksRegistered;
  }

  public task(taskName: string, config: ITaskConfiguration, taskCallback: Function): void {

    const help = config.help || 'no help provided';

    this._registerTaskToCli(taskName, help);

    return this.gulpAdapter.runTask(taskName, taskCallback);
  }

  private _registerTaskToCli(taskName: string, help: string): void {

    this.cli.command(taskName, help)
      .action((args, callback) => {
        return this._runTaskFromCli(taskName, args, callback);
      });
  }

  private _ensureTaskIsRegisteredToCli(taskName: string): void {
    const isTaskRegisteredToCli = this.cli.find(taskName);

    if (!isTaskRegisteredToCli) {
      throw new Error('Task "${taskName}" is not registered.');
    }
  }

  private _runTaskFromCli(taskName: string, args: ICliTaskArguments, callback: Function): void {

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

  private _runCommandInChildProcess(command: string, callback: Function): void {

    const commandCallback = (error, stdout, stderr) => {
      console.log(stdout);
      callback();
    }

    const execOptions: any = {
      shell: true,
    };

    exec(command, execOptions, commandCallback);
  }

  private _registerConventionalTaskToCli(taskName: string): void {

    const help = this._getHelpForConventionalTask(taskName);

    this._registerTaskToCli(taskName, help);
  }

  private _registerConventionalTask(taskName: string): void {

    this._registerConventionalTaskToCli(taskName);

    const taskConfig = this._getConventionalTaskConfig(taskName);
    const buildTasks = this._getBuildTasksForConventionalTask(taskName);

    this.gulpAdapter.registerConventionalTask(taskName, taskConfig, buildTasks);
  }

  private _getConventionalTaskConfig(taskName: string): IConventionalTaskConfiguration {
    return this.config.conventionalTasks[taskName];
  }

  private _getHelpForConventionalTask(taskName: string): string {

    const taskConfig = this._getConventionalTaskConfig(taskName);

    if (!taskConfig) {
      return 'help not found';
    }

    return this.config.conventionalTasks[taskName].help;
  }

  private _getPluginKeysGroupedByPriority(): IGroupedPluginKeys {

    const allPluginKeys = this._getPluginKeys();

    const groupedPluginKeys = groupBy(allPluginKeys, (key) => {

      const config = this._getPluginConfig(key);

      return config.priority;
    });

    return groupedPluginKeys;
  }

  private _getPluginKeys(): Array<string> {
    return Object.keys(this.pluginConfigs);
  }

  private _getPlugin(name: string): IGulptraumPlugin {
    return this.plugins[name];
  }

  private _getPluginConfig(name: string): IPluginConfiguration {
    return this.pluginConfigs[name];
  }

  private _getPluginDefaultConfig(name: string): IPluginConfiguration {

    if (!this.plugins[name]) {
      throw new Error(`Default configuration for plugin "${name}" is missing.`);
    }

    const config = clone(this.config);

    return this.plugins[name].getDefaultConfig(config);
  }

  private _getResolvedPluginConfig(name: string): IPluginConfiguration {

    const pluginConfig = this._getPluginConfig(name);
    const pluginDefaultConfig = this._getPluginDefaultConfig(name);

    const resolvedConfig = this._mergeConfigs(pluginDefaultConfig, pluginConfig);

    return resolvedConfig;
  }

  private _getPluginKeysOrderedByPriority(): Array<string> {

    const allPluginKeys = this._getPluginKeys();

    const sortedPluginKeys = allPluginKeys.sort((a, b) => {

      const pluginAConfig = this._getPluginConfig(a);
      const pluginBConfig = this._getPluginConfig(b);

      return pluginBConfig.priority - pluginAConfig.priority;
    });

    return sortedPluginKeys;
  }

  private _mergeConfigs(defaultConfig: any, config: any): any {
    return merge(defaultConfig, config, mergeOptions);
  }

  public registerPlugin(name: string, plugin: IGulptraumPlugin, config: IPluginConfiguration, priority: number = 10): IBuildSystem {

    this.plugins[name] = plugin;

    this.pluginConfigs[name] = config;
    this.pluginConfigs[name].priority = priority;

    return this;
  }

}
