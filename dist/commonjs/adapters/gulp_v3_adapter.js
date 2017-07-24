"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runSequence = require("run-sequence");
var GulpV3Adapter = (function () {
    function GulpV3Adapter(gulpInstance, gulptraumInstance) {
        this._gulpInstance = gulpInstance;
        this._gulptraumInstance = gulptraumInstance;
    }
    Object.defineProperty(GulpV3Adapter.prototype, "gulp", {
        get: function () {
            return this._gulpInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GulpV3Adapter.prototype, "gulptraum", {
        get: function () {
            return this._gulptraumInstance;
        },
        enumerable: true,
        configurable: true
    });
    GulpV3Adapter.prototype.isTaskRegistered = function (taskName) {
        var tasks = this.getGulpTasks();
        return tasks.indexOf(taskName) >= 0;
    };
    GulpV3Adapter.prototype.runTasksSequential = function (tasks, callback) {
        var args = tasks.concat(callback);
        return runSequence.use(this.gulp).apply(void 0, args);
    };
    GulpV3Adapter.prototype.runTasksParallel = function (tasks, callback) {
        return runSequence.use(this.gulp)(tasks, callback);
    };
    GulpV3Adapter.prototype.registerConventionalTask = function (taskName, taskConfig, buildTasks) {
        var _this = this;
        var taskChain = taskConfig.tasksBefore || [];
        Array.prototype.push.apply(taskChain, buildTasks);
        this.gulp.task("" + taskName, function (callback) {
            var finishSequenceHandler = function (error) {
                return _this._handleRunSequenceError(error, callback);
            };
            if (taskChain.length <= 0 || taskChain.some(function (task) {
                return Array.isArray(task) && task.length === 0;
            })) {
                _this._handleEmptySequence(taskName);
                return callback();
            }
            else {
                _this.gulptraum.gulpAdapter.runTasksSequential(taskChain, finishSequenceHandler);
            }
        });
    };
    GulpV3Adapter.prototype._handleEmptySequence = function (taskName) {
        console.log("No sub tasks found for top level task \"" + taskName + "\".");
    };
    GulpV3Adapter.prototype._handleRunSequenceError = function (error, callback) {
        if (this.gulptraum.config.suppressErrors) {
            return callback();
        }
        if (error) {
            var exitCode = 2;
            console.log('[ERROR] gulp build task failed', error);
            console.log('[FAIL] gulp build task failed - exiting with code ' + exitCode);
            return process.exit(exitCode);
        }
        else {
            return callback();
        }
    };
    GulpV3Adapter.prototype.runTask = function (taskName, taskCallback) {
        var gulpTaskArgs = [
            taskName,
            taskCallback
        ];
        return this.gulp.task.apply(this.gulp, gulpTaskArgs);
    };
    GulpV3Adapter.prototype.getGulpTasks = function () {
        return Object.keys(this.gulp.tasks);
    };
    GulpV3Adapter.prototype.registerGulpTask = function (taskName, taskCallback) {
        var gulpTaskArgs = [
            taskName,
            taskCallback
        ];
        return this.gulp.task.apply(this.gulp, gulpTaskArgs);
    };
    return GulpV3Adapter;
}());
exports.GulpV3Adapter = GulpV3Adapter;

//# sourceMappingURL=gulp_v3_adapter.js.map
