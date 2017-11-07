'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var merge = require("deepmerge");
var groupBy = require("lodash.groupby");
var index_1 = require("./index");
var child_process_1 = require("child_process");
var vorpal = require("vorpal");
var clone = require("clone");
var gulp = require("gulp");
var index_2 = require("./adapters/index");
var systemTasks = require("./tasks/index");
function mergeArray(destinationArray, sourceArray, mergeOptions) {
    return sourceArray;
}
var mergeOptions = {
    arrayMerge: mergeArray,
};
var BuildSystem = (function () {
    function BuildSystem(config) {
        this.pluginConfigs = new Map();
        this.plugins = new Map();
        this.config = {};
        this.config = config;
        this.initialize();
    }
    Object.defineProperty(BuildSystem.prototype, "tasks", {
        get: function () {
            return this.gulpAdapter.getGulpTasks();
        },
        enumerable: true,
        configurable: true
    });
    BuildSystem.prototype.initialize = function () {
        this.cli = vorpal();
    };
    BuildSystem.prototype._initializeGulpVersionAdapter = function () {
        var isVersion3 = typeof Object.getPrototypeOf(this.gulp).run !== 'undefined';
        if (isVersion3) {
            this.gulpAdapter = new index_2.GulpV3Adapter(this.gulp, this);
        }
        else {
            this.gulpAdapter = new index_2.GulpV4Adapter(this.gulp, this);
        }
    };
    BuildSystem.prototype._validateBuildSystemConfig = function (config) {
        if (!config.packageName) {
            try {
                var packageManifestPath = path.resolve(config.paths.root + "/package.json");
                var packageManifest = require(packageManifestPath);
                if (packageManifest) {
                    config.fullPackageName = packageManifest.name;
                    var name_1 = packageManifest.name;
                    if (name_1[0] == '@') {
                        name_1 = name_1.slice(1);
                    }
                    config.packageName = name_1;
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    };
    BuildSystem.prototype.registerTasks = function (externalGulp) {
        this.gulp = externalGulp || gulp;
        this._initializeGulpVersionAdapter();
        this.config = this._mergeConfigs(index_1.DefaultBuildSystemConfig, this.config);
        this._validateBuildSystemConfig(this.config);
        this._registerTasksBeforePlugins();
        this._initializePlugins();
        this._registerTasksAfterPlugins();
        this._registerSystemTasks();
    };
    BuildSystem.prototype._registerSystemTasks = function () {
        var _this = this;
        var systemTasks = this._getSystemTasks();
        systemTasks.forEach(function (systemTask) {
            _this._registerSystemTask(systemTask);
        });
    };
    BuildSystem.prototype._registerSystemTask = function (taskName) {
        var task = this._getSystemTask(taskName);
        if (!task.excludeTaskFromCli) {
            this._registerTaskToCli(task.name, task.help);
        }
        task.generate(this.gulp, this.config, this);
    };
    BuildSystem.prototype._getSystemTasks = function () {
        return Object.keys(systemTasks);
    };
    BuildSystem.prototype._getSystemTask = function (taskName) {
        return systemTasks[taskName];
    };
    BuildSystem.prototype._initializePlugins = function () {
        var _this = this;
        var pluginsToInitialize = this._getPluginKeysOrderedByPriority();
        pluginsToInitialize.forEach(function (plugin) {
            _this._initializePlugin(plugin);
        });
    };
    BuildSystem.prototype._initializePlugin = function (name) {
        var plugin = this._getPlugin(name);
        var configUsed = this._getResolvedPluginConfig(name);
        plugin.initializePlugin(this.gulp, configUsed, this);
    };
    BuildSystem.prototype._registerTasksBeforePlugins = function () {
    };
    BuildSystem.prototype._registerTasksAfterPlugins = function () {
        this._registerConventionalTasks();
    };
    BuildSystem.prototype._registerConventionalTasks = function () {
        var _this = this;
        var conventionalTasks = Object.keys(this.config.conventionalTasks);
        conventionalTasks.forEach(function (conventionalTask) {
            _this._registerConventionalTask(conventionalTask);
        });
    };
    BuildSystem.prototype._getTasksInRunningOrder = function (pluginKeys) {
        var pluginKeysGroupedByPriority = this._getPluginKeysGroupedByPriority();
        var groupKeys = Object.keys(pluginKeysGroupedByPriority);
        var groupKeysSorted = groupKeys.sort(function (a, b) {
            return +b - +a;
        });
        var allTasks = [];
        groupKeysSorted.forEach(function (key) {
            var tasks = pluginKeysGroupedByPriority[key];
            allTasks.push(tasks);
        });
        return allTasks;
    };
    BuildSystem.prototype._getTaskNameByConvention = function (taskName, pluginKey) {
        return taskName + "-" + pluginKey;
    };
    BuildSystem.prototype._getBuildTasksForConventionalTask = function (taskName) {
        var _this = this;
        var pluginKeys = this._getPluginKeysOrderedByPriority();
        var tasksInRunningOrder = this._getTasksInRunningOrder(pluginKeys);
        var topLevelTasks = tasksInRunningOrder.map(function (pluginKey) {
            if (Array.isArray(pluginKey)) {
                return pluginKey.map(function (subKey) {
                    return _this._getTaskNameByConvention(taskName, subKey);
                });
            }
            return [_this._getTaskNameByConvention(taskName, pluginKey)];
        });
        var tasksRegistered = topLevelTasks.map(function (subTasks) {
            return _this._filterUnregisteredTasks(subTasks);
        });
        return tasksRegistered;
    };
    BuildSystem.prototype._filterUnregisteredTasks = function (tasks) {
        var _this = this;
        var tasksRegistered = tasks.filter(function (task) {
            return _this.gulpAdapter.isTaskRegistered(task);
        });
        return tasksRegistered;
    };
    BuildSystem.prototype.task = function (taskName, config, taskCallback) {
        var help = config.help || 'no help provided';
        this._registerTaskToCli(taskName, help);
        return this.gulpAdapter.runTask(taskName, taskCallback);
    };
    BuildSystem.prototype._registerTaskToCli = function (taskName, help) {
        var _this = this;
        this.cli.command(taskName, help)
            .action(function (args, callback) {
            return _this._runTaskFromCli(taskName, args, callback);
        });
    };
    BuildSystem.prototype._ensureTaskIsRegisteredToCli = function (taskName) {
        var isTaskRegisteredToCli = this.cli.find(taskName);
        if (!isTaskRegisteredToCli) {
            throw new Error('Task "${taskName}" is not registered.');
        }
    };
    BuildSystem.prototype._runTaskFromCli = function (taskName, args, callback) {
        var optionKeys = Object.keys(args.options);
        var optionStrings = optionKeys.map(function (optionKey) {
            var optionValue = args.options[optionKey];
            return "--" + optionKey + " " + optionValue;
        });
        if (optionKeys.length === 0) {
            return this._runCommandInChildProcess("gulp " + taskName, callback);
        }
        var gulpCommand = ['gulp', taskName].concat(optionStrings)
            .join(' ')
            .trim();
        this._runCommandInChildProcess(gulpCommand, callback);
    };
    BuildSystem.prototype._runCommandInChildProcess = function (command, callback) {
        var commandCallback = function (error, stdout, stderr) {
            console.log(stdout);
            callback();
        };
        var execOptions = {
            shell: true,
        };
        child_process_1.exec(command, execOptions, commandCallback);
    };
    BuildSystem.prototype._registerConventionalTaskToCli = function (taskName) {
        var help = this._getHelpForConventionalTask(taskName);
        this._registerTaskToCli(taskName, help);
    };
    BuildSystem.prototype._registerConventionalTask = function (taskName) {
        this._registerConventionalTaskToCli(taskName);
        var taskConfig = this._getConventionalTaskConfig(taskName);
        var buildTasks = this._getBuildTasksForConventionalTask(taskName);
        this.gulpAdapter.registerConventionalTask(taskName, taskConfig, buildTasks);
    };
    BuildSystem.prototype._getConventionalTaskConfig = function (taskName) {
        return this.config.conventionalTasks[taskName];
    };
    BuildSystem.prototype._getHelpForConventionalTask = function (taskName) {
        var taskConfig = this._getConventionalTaskConfig(taskName);
        if (!taskConfig) {
            return 'help not found';
        }
        return this.config.conventionalTasks[taskName].help;
    };
    BuildSystem.prototype._getPluginKeysGroupedByPriority = function () {
        var _this = this;
        var allPluginKeys = this._getPluginKeys();
        var groupedPluginKeys = groupBy(allPluginKeys, function (key) {
            var config = _this._getPluginConfig(key);
            return config.priority;
        });
        return groupedPluginKeys;
    };
    BuildSystem.prototype._getPluginKeys = function () {
        return Object.keys(this.pluginConfigs);
    };
    BuildSystem.prototype._getPlugin = function (name) {
        return this.plugins[name];
    };
    BuildSystem.prototype._getPluginConfig = function (name) {
        return this.pluginConfigs[name];
    };
    BuildSystem.prototype._getPluginDefaultConfig = function (name) {
        if (!this.plugins[name]) {
            throw new Error("Default configuration for plugin \"" + name + "\" is missing.");
        }
        var config = clone(this.config);
        return this.plugins[name].getDefaultConfig(config);
    };
    BuildSystem.prototype._getResolvedPluginConfig = function (name) {
        var pluginConfig = this._getPluginConfig(name);
        var pluginDefaultConfig = this._getPluginDefaultConfig(name);
        var resolvedConfig = this._mergeConfigs(pluginDefaultConfig, pluginConfig);
        return resolvedConfig;
    };
    BuildSystem.prototype._getPluginKeysOrderedByPriority = function () {
        var _this = this;
        var allPluginKeys = this._getPluginKeys();
        var sortedPluginKeys = allPluginKeys.sort(function (a, b) {
            var pluginAConfig = _this._getPluginConfig(a);
            var pluginBConfig = _this._getPluginConfig(b);
            return pluginBConfig.priority - pluginAConfig.priority;
        });
        return sortedPluginKeys;
    };
    BuildSystem.prototype._mergeConfigs = function (defaultConfig, config) {
        return merge(defaultConfig, config, mergeOptions);
    };
    BuildSystem.prototype.registerPlugin = function (name, plugin, config, priority) {
        if (priority === void 0) { priority = 10; }
        this.plugins[name] = plugin;
        this.pluginConfigs[name] = config;
        this.pluginConfigs[name].priority = priority;
        return this;
    };
    return BuildSystem;
}());
exports.BuildSystem = BuildSystem;

//# sourceMappingURL=build_system.js.map
