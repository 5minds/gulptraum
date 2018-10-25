import { IGulpVersionAdapter } from './../index';
import { Gulp } from 'gulp';
export declare class GulpV4Adapter implements IGulpVersionAdapter {
    private _gulpInstance;
    private _gulptraumInstance;
    readonly gulp: Gulp;
    readonly gulptraum: any;
    constructor(gulpInstance: Gulp, gulptraumInstance: any);
    isTaskRegistered(taskName: string): boolean;
    runTasksSequential(tasks: any, callback: any): any;
    runTasksParallel(tasks: Array<string>, callback: any): any;
    registerConventionalTask(taskName: string, taskConfig: any, buildTasks: Array<Array<string>>): void;
    private _handleEmptySequence;
    private _handleRunSequenceError;
    runTask(taskName: string, taskCallback: Function): void;
    getGulpTasks(): string[];
    registerGulpTask(taskName: string, taskCallback: Function): void;
}
