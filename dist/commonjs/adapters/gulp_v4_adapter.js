"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        console.log('GET GULP TASKS', tasks);
        return tasks.indexOf(taskName) >= 0;
    };
    GulpV4Adapter.prototype.runTasksSequential = function (tasks, callback) {
      console.log(tasks);
      const filteredTasks = this._filterEmptyTasks(tasks);
      console.log(filteredTasks);
      if (filteredTasks.length === 0) {
        return callback();
      }
      const sequenceFunc = this.gulp.series(filteredTasks);
      return sequenceFunc(callback);
    };
    GulpV4Adapter.prototype.runTasksParallel = function (tasks, callback) {
      console.log(tasks);
      const filteredEmptyTasks = this._filterEmptyTasks(tasks);
      console.log(filteredEmptyTasks);
      if (filteredTasks.length === 0) {
        return callback();
      }
      const parallelFunc = this.gulp.parallel(filteredEmptyTasks);
      return parallelFunc(callback);
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
                return _this._handleRunSequenceError(error, taskName, callback);
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
    GulpV4Adapter.prototype._handleRunSequenceError = function (error, task, callback) {
        var suppressErrorsForTask = this.gulptraum.config.suppressErrorsForTasks && this.gulptraum.config.suppressErrorsForTasks.indexOf(task) !== -1;
        if (this.gulptraum.config.suppressErrors || suppressErrorsForTask) {
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
    GulpV4Adapter.prototype.getGulpTasks = function () {
        console.log(this.gulp.registry().tasks());
        return Object.keys(this.gulp.registry().tasks());
    };
    GulpV4Adapter.prototype.registerGulpTask = function (taskName, taskCallback) {
        console.log('REGISTER V4 GULP TASK');
        console.log(taskName);
        console.log(taskCallback);
        return this.gulp.task(taskName, taskCallback);
    };
    GulpV4Adapter.prototype.runTask = function (taskName, taskCallback) {
      throw new Error('Cannot use runTask with gulp v4. Use registerGulpTask instead.');
    };
    GulpV4Adapter.prototype._filterEmptyTasks = function (tasks) {
      const filteredTasks = tasks.filter((task) => {
        if (Array.isArray(task)) {
          return task.length > 0;
        }
        return task !== undefined;
      });
      return filteredTasks;
    };
    return GulpV4Adapter;
}());
exports.GulpV4Adapter = GulpV4Adapter;

//# sourceMappingURL=gulp_v4_adapter.js.map
