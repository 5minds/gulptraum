export interface IGulptraumPlugin {
  initializePlugin: IGulptraumHook;
  getDefaultConfig: IConfigurationHook;
}

export interface ITaskConfiguration {
  help: string;
}

export interface ICliTaskArguments {
  options: {
    [optionKey: string]: string;
  };
}

export interface IBuildSystem {

}

export interface IGulpVersionAdapter {
  getGulpTasks(): Array<string>;
  runTask(taskName: string, taskCallback: Function): void;
  registerConventionalTask(taskName: string, taskConfig: any, buildTasks: Array<Array<string>>): void;
  isTaskRegistered(taskName: string): boolean;
  registerGulpTask(taskName: string, taskCallback: Function): void;
}

export interface IConfigurationHook {
  (buildSystemConfig: IBuildSystemConfiguration): IPluginConfiguration;
}

export interface IPluginConfiguration<T extends IBuildSystemPathsConfiguration = IBuildSystemPathsConfiguration> extends IBuildSystemConfiguration<T> {
  pluginName: string;
  priority?: number;
}

export interface IPathsConfiguration {
  [pathName: string]: string;
}

export interface IGulptraumTypeScriptPluginConfiguration extends IPluginConfiguration {
  
}

export interface IBuildSystemConfiguration<T extends IBuildSystemPathsConfiguration = IBuildSystemPathsConfiguration> {
  packageName?: string;
  suppressErrors?: false,
  backupSetupFiles?: boolean;
  paths?: T,
  conventionalTasks?: {
    [taskName: string]: IConventionalTaskConfiguration;
  },
  plugins?: {
    [pluginName: string]: IPluginConfiguration;
  }
}

export interface IBuildSystemPathsConfiguration {
  root: string;
  source: string;
  tests: string;
  output: string;
  testOutput: string;
  doc: string;
  setup: string;
  changelog: string;
}

export interface IConventionalTaskConfiguration {
  help?: string,
  tasksBefore?: Array<string>;
  tasksAfter?: Array<string>;
}

export interface IGroupedPluginKeys {
  [priority: number]: Array<string>;
}

export interface IGulptraumHook {
  (gulp: any, config: any, gulptraum: IBuildSystem): void;
}

export interface IBuildSystem {

}