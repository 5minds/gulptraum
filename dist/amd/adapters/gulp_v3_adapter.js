define(["require", "exports", "run-sequence"], function (require, exports, runSequence) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GulpV3Adapter {
        get gulp() {
            return this._gulpInstance;
        }
        get gulptraum() {
            return this._gulptraumInstance;
        }
        constructor(gulpInstance, gulptraumInstance) {
            this._gulpInstance = gulpInstance;
            this._gulptraumInstance = gulptraumInstance;
        }
        isTaskRegistered(taskName) {
            const tasks = this.getGulpTasks();
            return tasks.indexOf(taskName) >= 0;
        }
        runTasksSequential(tasks, callback) {
            const args = tasks.concat(callback);
            return runSequence.use(this.gulp)(...args);
        }
        runTasksParallel(tasks, callback) {
            return runSequence.use(this.gulp)(tasks, callback);
        }
        registerConventionalTask(taskName, taskConfig, buildTasks) {
            const taskChain = taskConfig.tasksBefore || [];
            Array.prototype.push.apply(taskChain, buildTasks);
            this.gulp.task(`${taskName}`, (callback) => {
                const finishSequenceHandler = (error) => {
                    return this._handleRunSequenceError(error, callback);
                };
                if (taskChain.length <= 0 || taskChain.some((task) => {
                    return Array.isArray(task) && task.length === 0;
                })) {
                    this._handleEmptySequence(taskName);
                    return callback();
                }
                else {
                    this.gulptraum.gulpAdapter.runTasksSequential(taskChain, finishSequenceHandler);
                }
            });
        }
        _handleEmptySequence(taskName) {
            console.log(`No sub tasks found for top level task "${taskName}".`);
        }
        _handleRunSequenceError(error, callback) {
            if (this.gulptraum.config.suppressErrors) {
                return callback();
            }
            if (error) {
                const exitCode = 2;
                console.log('[ERROR] gulp build task failed', error);
                console.log('[FAIL] gulp build task failed - exiting with code ' + exitCode);
                return process.exit(exitCode);
            }
            else {
                return callback();
            }
        }
        runTask(taskName, taskCallback) {
            const gulpTaskArgs = [
                taskName,
                taskCallback
            ];
            return this.gulp.task.apply(this.gulp, gulpTaskArgs);
        }
        getGulpTasks() {
            return Object.keys(this.gulp.tasks);
        }
        registerGulpTask(taskName, taskCallback) {
            const gulpTaskArgs = [
                taskName,
                taskCallback
            ];
            return this.gulp.task.apply(this.gulp, gulpTaskArgs);
        }
    }
    exports.GulpV3Adapter = GulpV3Adapter;
});

//# sourceMappingURL=gulp_v3_adapter.js.map
