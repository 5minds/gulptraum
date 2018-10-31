import {IGulpVersionAdapter} from './../index';
import {Gulp} from 'gulp';
import * as Undertaker from 'undertaker';

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

  public runTasksSequential(tasks: Array<any>, callback): any {

    const filteredTasks: Array<any> = this._filterEmptyTasks(tasks);

    if (filteredTasks.length === 0) {
      return callback();
    }
    const sequenceFunc: Undertaker.TaskFunction = this.gulp.series(filteredTasks);
    return sequenceFunc(callback);
  }

  public runTasksParallel(tasks: Array<any>, callback): any {

    const filteredTasks: Array<any> = this._filterEmptyTasks(tasks);

    if (filteredTasks.length === 0) {
      return callback();
    }
    const parallelFunc: Undertaker.TaskFunction = this.gulp.parallel(filteredTasks);
    return parallelFunc(callback);
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

  public registerGulpTask(taskName: string, taskCallback: any): void {
    return this.gulp.task(taskName, taskCallback);
  }

  public getGulpTasks(): string[] {

    const tasks = this.gulp
      .registry()
      .tasks();

    return Object.keys(tasks);
  }

  public runTask(taskName: string, taskCallback: Function): void {
    throw new Error('Cannot use runTask with gulp v4. Use "registerGulpTask" and then "runTasksSequential" or "runTasksParallel" instead.');
  }

  private _filterEmptyTasks(tasks: Array<any>): Array<any> {

    const filteredTasks = tasks.filter((task) => {

      if (Array.isArray(task)) {
        return task.length > 0;
      }

      return task !== undefined;
    });
    return filteredTasks;
  }

}
