define(["require", "exports", "path", "deepmerge", "lodash.groupby", "./index", "child_process", "vorpal", "clone", "gulp", "./adapters/index", "./tasks/index"], function (require, exports, path, merge, groupBy, index_1, child_process_1, vorpal, clone, gulp, index_2, systemTasks) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function mergeArray(destinationArray, sourceArray, mergeOptions) {
        return sourceArray;
    }
    const mergeOptions = {
        arrayMerge: mergeArray,
    };
    class BuildSystem {
        constructor(config) {
            this.pluginConfigs = new Map();
            this.plugins = new Map();
            this.config = {};
            this.config = config;
            this.initialize();
        }
        get tasks() {
            return this.gulpAdapter.getGulpTasks();
        }
        initialize() {
            this.cli = vorpal();
        }
        _initializeGulpVersionAdapter() {
            const isVersion3 = typeof Object.getPrototypeOf(this.gulp).run !== 'undefined';
            if (isVersion3) {
                this.gulpAdapter = new index_2.GulpV3Adapter(this.gulp, this);
            }
            else {
                this.gulpAdapter = new index_2.GulpV4Adapter(this.gulp, this);
            }
        }
        _validateBuildSystemConfig(config) {
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
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        registerTasks(externalGulp) {
            this.gulp = externalGulp || gulp;
            this._initializeGulpVersionAdapter();
            this.config = this._mergeConfigs(index_1.DefaultBuildSystemConfig, this.config);
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
        _getTasksInRunningOrder(pluginKeys) {
            const pluginKeysGroupedByPriority = this._getPluginKeysGroupedByPriority();
            const groupKeys = Object.keys(pluginKeysGroupedByPriority);
            const groupKeysSorted = groupKeys.sort((a, b) => {
                return +b - +a;
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
            const topLevelTasks = tasksInRunningOrder.map((pluginKey) => {
                if (Array.isArray(pluginKey)) {
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
        _filterUnregisteredTasks(tasks) {
            const tasksRegistered = tasks.filter((task) => {
                return this.gulpAdapter.isTaskRegistered(task);
            });
            return tasksRegistered;
        }
        task(taskName, config, taskCallback) {
            const help = config.help || 'no help provided';
            this._registerTaskToCli(taskName, help);
            return this.gulpAdapter.runTask(taskName, taskCallback);
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
            };
            const execOptions = {
                shell: true,
            };
            child_process_1.exec(command, execOptions, commandCallback);
        }
        _registerConventionalTaskToCli(taskName) {
            const help = this._getHelpForConventionalTask(taskName);
            this._registerTaskToCli(taskName, help);
        }
        _registerConventionalTask(taskName) {
            this._registerConventionalTaskToCli(taskName);
            const taskConfig = this._getConventionalTaskConfig(taskName);
            const buildTasks = this._getBuildTasksForConventionalTask(taskName);
            this.gulpAdapter.registerConventionalTask(taskName, taskConfig, buildTasks);
        }
        _getConventionalTaskConfig(taskName) {
            return this.config.conventionalTasks[taskName];
        }
        _getHelpForConventionalTask(taskName) {
            const taskConfig = this._getConventionalTaskConfig(taskName);
            if (!taskConfig) {
                return 'help not found';
            }
            return this.config.conventionalTasks[taskName].help;
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
            console.log(Object.keys(this.plugins));
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
            return merge(defaultConfig, config, mergeOptions);
        }
        registerPlugin(name, plugin, config, priority = 10) {
            this.plugins[name] = plugin;
            this.pluginConfigs[name] = config;
            this.pluginConfigs[name].priority = priority;
            return this;
        }
    }
    exports.BuildSystem = BuildSystem;
});

//# sourceMappingURL=build_system.js.map
