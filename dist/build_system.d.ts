import { IPluginConfiguration, IGulptraumPlugin, IGulpVersionAdapter, ITaskConfiguration, IBuildSystem, IBuildSystemConfiguration } from './index';
export declare class BuildSystem implements IBuildSystem {
    pluginConfigs: Map<string, IPluginConfiguration>;
    plugins: Map<string, IGulptraumPlugin>;
    gulpAdapter: IGulpVersionAdapter;
    gulp: any;
    config: IBuildSystemConfiguration;
    cli: any;
    constructor(config: IBuildSystemConfiguration);
    readonly tasks: string[];
    initialize(): void;
    private _initializeGulpVersionAdapter;
    private _validateBuildSystemConfig;
    registerTasks(externalGulp?: any): void;
    _registerSystemTasks(): void;
    _registerSystemTask(taskName: any): void;
    _getSystemTasks(): string[];
    _getSystemTask(taskName: any): any;
    _initializePlugins(): void;
    _initializePlugin(name: any): void;
    _registerTasksBeforePlugins(): void;
    _registerTasksAfterPlugins(): void;
    _registerConventionalTasks(): void;
    private _getTasksInRunningOrder;
    private _getTaskNameByConvention;
    private _getBuildTasksForConventionalTask;
    private _filterUnregisteredTasks;
    task(taskName: string, config: ITaskConfiguration, taskCallback: Function): void;
    private _registerTaskToCli;
    private _ensureTaskIsRegisteredToCli;
    private _runTaskFromCli;
    private _runCommandInChildProcess;
    private _registerConventionalTaskToCli;
    private _registerConventionalTask;
    private _getConventionalTaskConfig;
    private _getHelpForConventionalTask;
    private _getPluginKeysGroupedByPriority;
    private _getPluginKeys;
    private _getPlugin;
    private _getPluginConfig;
    private _getPluginDefaultConfig;
    private _getResolvedPluginConfig;
    private _getPluginKeysOrderedByPriority;
    private _mergeConfigs;
    registerPlugin(name: string, plugin: IGulptraumPlugin, config: IPluginConfiguration, priority?: number): IBuildSystem;
}
