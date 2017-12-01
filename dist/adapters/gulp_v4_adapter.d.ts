import { IGulpVersionAdapter } from './../index';
export declare class GulpV4Adapter implements IGulpVersionAdapter {
    private _gulpInstance;
    private _gulptraumInstance;
    readonly gulp: any;
    readonly gulptraum: any;
    constructor(gulpInstance: any, gulptraumInstance: any);
    isTaskRegistered(taskName: string): boolean;
    runTasksSequential(tasks: any, callback: any): any;
    runTasksParallel(tasks: Array<string>, callback: any): any;
    registerConventionalTask(taskName: string, taskConfig: any, buildTasks: Array<Array<string>>): void;
    private _handleEmptySequence(taskName);
    private _handleRunSequenceError(error, task, callback);
    runTask(taskName: string, taskCallback: Function): void;
    getGulpTasks(): string[];
    registerGulpTask(taskName: string, taskCallback: Function): void;
}
