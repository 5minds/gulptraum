"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runSequence = require("run-sequence");
var GulpV4Adapter = (function () {
    function GulpV4Adapter(gulpInstance, gulptraumInstance) {
        this._gulpInstance = gulpInstance;
        this._gulptraumInstance = gulptraumInstance;
    }
    Object.defineProperty(GulpV4Adapter.prototype, "gulp", {
        get: function () {
            return this._gulpInstance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GulpV4Adapter.prototype, "gulptraum", {
        get: function () {
            return this._gulptraumInstance;
        },
        enumerable: true,
        configurable: true
    });
    GulpV4Adapter.prototype.isTaskRegistered = function (taskName) {
        var tasks = this.getGulpTasks();
        return tasks.indexOf(taskName) >= 0;
    };
    GulpV4Adapter.prototype.runTasksSequential = function (tasks, callback) {
        var args = tasks.concat(callback);
        return runSequence.use(this.gulp).apply(void 0, args);
    };
    GulpV4Adapter.prototype.runTasksParallel = function (tasks, callback) {
        return runSequence.use(this.gulp)(tasks, callback);
    };
    GulpV4Adapter.prototype.registerConventionalTask = function (taskName, taskConfig, buildTasks) {
        var _this = this;
        var taskChain = taskConfig.tasksBefore || [];
        Array.prototype.push.apply(taskChain, buildTasks);
        this.gulp.task("" + taskName, function (callback) {
            var callbackWrapper = function () {
                _this._handleEmptySequence(taskName);
                return callback();
            };
            var finishSequenceHandler = function (error) {
                return _this._handleRunSequenceError(error, callback);
            };
            if (taskChain.length > 0) {
                callbackWrapper = finishSequenceHandler;
            }
            _this.gulptraum.gulpAdapter.runTasksSequential(taskChain, callbackWrapper);
        });
    };
    GulpV4Adapter.prototype._handleEmptySequence = function (taskName) {
        console.log("No sub tasks found for top level task \"" + taskName + "\".");
    };
    GulpV4Adapter.prototype._handleRunSequenceError = function (error, callback) {
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
    GulpV4Adapter.prototype.runTask = function (taskName, taskCallback) {
        var gulpTaskArgs = [
            taskName,
            taskCallback
        ];
        return this.gulp.task.apply(this.gulp, gulpTaskArgs);
    };
    GulpV4Adapter.prototype.getGulpTasks = function () {
        return Object.keys(this.gulp.tasks);
    };
    GulpV4Adapter.prototype.registerGulpTask = function (taskName, taskCallback) {
        var gulpTaskArgs = [
            taskName,
            taskCallback
        ];
        return this.gulp.task.apply(this.gulp, gulpTaskArgs);
    };
    return GulpV4Adapter;
}());
exports.GulpV4Adapter = GulpV4Adapter;

//# sourceMappingURL=gulp_v4_adapter.js.map
