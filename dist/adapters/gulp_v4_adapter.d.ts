import { IGulpVersionAdapter } from './../index';
import { Gulp } from 'gulp';
export declare class GulpV4Adapter implements IGulpVersionAdapter {
    private _gulpInstance;
    private _gulptraumInstance;
    readonly gulp: Gulp;
    readonly gulptraum: any;
    constructor(gulpInstance: Gulp, gulptraumInstance: any);
    isTaskRegistered(taskName: string): boolean;
    runTasksSequential(tasks: Array<any>, callback: any): any;
    runTasksParallel(tasks: Array<any>, callback: any): any;
    registerConventionalTask(taskName: string, taskConfig: any, buildTasks: Array<Array<string>>): void;
    private _handleEmptySequence;
    private _handleRunSequenceError;
    registerGulpTask(taskName: string, taskCallback: any): void;
    getGulpTasks(): string[];
    runTask(taskName: string, taskCallback: Function): void;
    private _filterEmptyTasks;
}
