import {IGulpVersionAdapter} from './../index';
import * as runSequence from 'run-sequence';
import {Gulp} from 'gulp';

export class GulpV4Adapter implements IGulpVersionAdapter {

  private _gulpInstance: Gulp;
  private _gulptraumInstance: any;

  public get gulp(): Gulp {
    return this._gulpInstance;
  }

  public get gulptraum(): any {
    return this._gulptraumInstance;
  }

  constructor(gulpInstance: Gulp, gulptraumInstance: any) {
    this._gulpInstance = gulpInstance;
    this._gulptraumInstance = gulptraumInstance;
  }

  public isTaskRegistered(taskName: string): boolean {
    const tasks = this.getGulpTasks();
    return tasks.indexOf(taskName) >= 0;
  }

  public runTasksSequential(tasks, callback): any {
    const args = tasks.concat(callback);
    return runSequence.use(this.gulp)(...args);
  }

  public runTasksParallel(tasks: Array<string>, callback): any {
    return runSequence.use(this.gulp)(tasks, callback);
  }

  public registerConventionalTask(taskName: string, taskConfig: any, buildTasks: Array<Array<string>>): void {

    const taskChain = taskConfig.tasksBefore || [];
    Array.prototype.push.apply(taskChain, buildTasks);

    this.gulp.task(`${taskName}`, (callback) => {

      let callbackWrapper: Function = () => {
        this._handleEmptySequence(taskName);
        return callback();
      };

      const finishSequenceHandler = (error) => {
        return this._handleRunSequenceError(error, taskName, callback);
      };

      if (taskChain.length > 0) {
        callbackWrapper = finishSequenceHandler;
      }

      this.gulptraum.gulpAdapter.runTasksSequential(taskChain, callbackWrapper);
    });
  }

  private _handleEmptySequence(taskName: string): void {
    console.log(`No sub tasks found for top level task "${taskName}".`);
  }

  private _handleRunSequenceError(error: Error, task: string, callback: Function): any {

    const suppressErrorsForTask = this.gulptraum.config.suppressErrorsForTasks && this.gulptraum.config.suppressErrorsForTasks.indexOf(task) !== -1;

    if (this.gulptraum.config.suppressErrors || suppressErrorsForTask) {
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

  public runTask(taskName: string, taskCallback: Function): void {

    const gulpTaskArgs = [
      taskName,
      taskCallback
    ];

    return this.gulp.task.apply(this.gulp, gulpTaskArgs);
  }

  public getGulpTasks(): string[] {
    return Object.keys(this.gulp.registry().tasks);
  }

  public registerGulpTask(taskName: string, taskCallback: Function): void {

    const gulpTaskArgs = [
      taskName,
      taskCallback
    ];

    return this.gulp.task.apply(this.gulp, gulpTaskArgs);
  }

}
