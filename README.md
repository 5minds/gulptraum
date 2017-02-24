
![logo](logo.png)

# gulptraum

A simple-to-use build system based on gulp.

# Features

```

* Fluent Declaration Syntax for your gulpfile.js

* Plugins for popular technologies that provide all tasks you need like
   * build   * test   * clean   * doc   * lint   * prepare-release   * setup-dev

* Default Configurations for an easy setup

* Setup a build pipeline with plugins in minutes

* Technologies supported:
  * TypeScript 2
  * SASS

```
## Introduction

gulptraum is a build system you can configure using a fluent syntax.
You can configure the technologies you would like to work with and optionally provide additional configuration for each plugin.

gulptraum will then make sure the corresponding gulp tasks are automatically generated when the gulpfile.js is used (that is when you run a gulp command).

So by configuring gulptraum you get to use a collection of gulp tasks that take care of the typical work you want the task runner to take care of.

## Usage

The following code snippet shows an example `gulpfile.js`.

```javascript

const gulptraum = require('gulptraum');
const gulp = require('gulp');

const buildSystem = new gulptraum.BuildSystem(buildSystemConfig);

buildSystem
  .registerPlugin('typescript', gulptraum.plugins.typescript)
  .registerPlugin('sass', gulptraum.plugins.sass)
  .registerTasks(gulp);
```

With this `gulpfile.js` in your project folder you can just run the following to build your typescript:

```shell
gulp build

[15:45:07] Using gulpfile ~/_dev/5minds/addict-ioc/gulpfile.js
[15:45:07] Starting 'build'...
[15:45:07] Starting 'clean'...
[15:45:07] Starting 'clean-sass'...
[15:45:07] Starting 'build-sass-clean'...
[15:45:07] Starting 'clean-typescript'...
[15:45:07] Starting 'build-typescript-clean'...
[15:45:07] Finished 'build-typescript-clean' after 8.85 ms
[15:45:07] Starting 'test-typescript-clean'...
[15:45:07] Finished 'test-typescript-clean' after 2.14 ms
[15:45:07] Starting 'doc-typescript-clean'...
[15:45:07] Finished 'doc-typescript-clean' after 1.26 ms
[15:45:07] Finished 'clean-typescript' after 14 ms
[15:45:07] Finished 'build-sass-clean' after 32 ms
[15:45:07] Finished 'clean-sass' after 32 ms
[15:45:07] Finished 'clean' after 32 ms
[15:45:07] Starting 'build-sass'...
[15:45:07] Starting 'build-typescript'...
[15:45:07] Starting 'build-typescript-index'...
[15:45:07] Finished 'build-sass' after 16 ms
[15:45:07] Finished 'build-typescript-index' after 20 ms
[15:45:07] Starting 'build-typescript-es2015'...
[15:45:07] Starting 'build-typescript-commonjs'...
[15:45:07] Starting 'build-typescript-amd'...
[15:45:07] Starting 'build-typescript-system'...
[15:45:07] Starting 'build-typescript-dts'...
[15:45:12] Finished 'build-typescript-commonjs' after 4.9 s
[15:45:12] Finished 'build-typescript-amd' after 4.9 s
[15:45:12] Finished 'build-typescript-system' after 4.9 s
[15:45:12] Finished 'build-typescript-es2015' after 4.91 s
[15:45:12] Finished 'build-typescript-dts' after 4.89 s
[15:45:12] Finished 'build-typescript' after 4.93 s
[15:45:12] Finished 'build' after 4.96 s
```

## Plugins

gulptraum is extensible through plugins that provide gulp tasks for particular technologies.


Currently gulptraum only provides its own plugins (currently for TypeScript 2 and SASS). We intend to implement more and more as we progress with the frameworks vision.

If you want to contribute gulp tasks you successfully use in your projects or want to learn details about the implementation of plugins - don't hesitate to contact us or open a pull request.

### Interface

If you want to use gulptraum to provide special tasks that are not provided yet you can write your own plugins.

Your plugins need to provide two exports to work with gulptraum:

* getDefaultConfig(buildSystemConfig)
* initializePlugin(gulp, config)

You can use these to register your own tasks.

#### Default Configuration

You can provide a default configuration for your plugin by exporting a key with a function like that:

```javascript
function getDefaultConfig(buildSystemConfig) {

  const config = {
    paths: {},
  };

  config.paths.typings = `${path.resolve(buildSystemConfig.paths.root, 'typings/')}/**/*.d.ts`;

  return config;
}

module.exports.getDefaultConfig = getDefaultConfig;
```

We recommend you use the build system config as a base for your own configuration. This makes sure that less paths have to be configured when using the system as a whole.

### TypeScript 2

#### Configuration

| Setting | Type | Description |
|---|---|---|
|paths|Object|Contains global application paths|
|paths.root|String|Your application root path (all other paths are relative to this path)|
|paths.source|String|Your source folder path|
|paths.tests|String|Your source tests path|
|paths.output|String|The output directory for build tasks|
|paths.testOutput|String|The output directory for building tests|
|paths.doc|String|The output directory for generated documentation|
|paths.setup|String|The output directory for generated code style files|
|paths.typings|String|Glob pattern for your type definition files|
|paths.excludes|Array of Strings |Glob patterns to exclude from sources|
|sort|Boolean|True if contents should be merged in alphabetical order|
|useTypeScriptForDTS|Boolean|True if type definitions should be generated from your TypeScript files|
|importsToAdd|Array of Strings|Resources you additionally want to require in your built code|
|paths.tslintConfig|String|Path to your `tslint.json` file|
|paths.compileToModules|Array of Strings|The module types generated from your TypeScript sources|

### SASS

| Setting | Type | Description |
|---|---|---|
|paths|Object|Contains global application paths|
|paths.root|String|Your application root path (all other paths are relative to this path)|
|paths.source|String|Your source folder path|
|paths.output|String|The output directory for build tasks|
|paths.doc|String|The output directory for generated documentation|
|paths.setup|String|The output directory for generated code style files|
|sort|Boolean|True if contents should be merged in alphabetical order|
|useTypeScriptForDTS|Boolean|True if type definitions should be generated from your TypeScript files|
|importsToAdd|Array of Strings|Resources you additionally want to require in your built code|
|paths.sasslintConfig|String|Path to your `sass-lint.yml` file|

#### Configuration

## Tasks

### Conventional Tasks

Conventional tasks are used to execute corresponding conventional tasks on plugins registered to gulptraum.

The convention in that reads as follows:

***{conventional-task} - {plugin} - {plugin-task} - {plugin-subtask}***

That means there might exist tasks like:
* gulp build
* gulp build-typescript
* gulp build-typescript-dts

So let's assume you got the `sass` and the `typescript` plugins registered to gulptraum.

Now if you run:

```
gulp build
```

that means gulptraum executes the following automatically for you:

```
gulp build-sass
gulp build-typescript
```

Of course you could just as easily run a conventional plugin task directly by using `gulp build-sass`.

#### build

The `build` task is used to perform all compilation tasks your project requires to run.

It runs the `clean` task before it starts.

The application code is compiled to the folder `dist` by default.

#### clean

The `clean` task erases all files and folders generated by the `build` and the `test` task.

#### test

The `test` task is used to run all tests you implemented in your project.

It runs the `build` task before it starts to ensure you actually test your latest code.

Some test tasks might need to compile special test code that you don't want to mix up with your compiled application code. The `test` task of the `typescript` plugin for example (called `test-typescript`) needs to build the `.ts` files of your tests. These are compiled to the folder `dist-test` by default while the application code is compiled to `dist` by default.

#### doc

The `doc` task is meant to generate all documentation you provided for your project.

#### lint

The `lint` task is meant to run all style checks that are provided by the plugins you configure to use.

#### setup-dev

The `setup-dev` task is meant to copy all code style files appropriate for the plugins you configure to use to your project root folder.

### System Tasks

#### prepare-release

The `prepare-release` task is meant to perform automated steps you want to perform before publishing a release.

Currently this task generates the changelog according to conventional changelog guidelines automatically for you.

#### help

The `help` task shows you the help descriptions for tasks registered to gulp.

##### help --task taskName

If you supply the task name as a parameter you can get the help for a specific task directly.

```
gulp help --task build

[16:17:14] Using gulpfile ~/_dev/5minds/addict-ioc/gulpfile.js
[16:17:14] Starting 'help'...

  Usage: build [options]

  Builds all source files

  Options:

    --help  output usage information

[16:17:14] Finished 'help' after 40 ms
```

#### gulptraum

The `gulptraum` task starts a cli in which you can easily explore the help.

#### tasks

The `tasks` task shows an overview of all tasks registered to gulp.

## Configuration

gulptraum provides default configurations for all technologies it supports.

However you can overwrite each configuration completely to customize the behavior to your needs.

### Build System

The build system configuration defines the main paths for your application. These paths are also used in the plugin-specific default configurations.

| Setting | Type | Description |
|---|---|---|
|paths|Object|Contains global application paths|
|paths.root|String|Your application root path (all other paths are relative to this path)|
|paths.source|String|Your source folder path|
|paths.tests|String|Your source tests path|
|paths.output|String|The output directory for build tasks|
|paths.testOutput|String|The output directory for building tests|
|paths.doc|String|The output directory for generated documentation|
|paths.setup|String|The output directory for generated code style files|
|paths.changelog|String|The path of your CHANGELOG.md file|
|paths.excludes|Array of Strings |Glob patterns to exclude from sources|
|packageName|String|The name of your application|
|sort|Boolean|True if contents should be merged in alphabetical order|
|suppressErrors|Boolean|True if errors should not be output to the console|
|backupSetupFiles|Boolean|True if existing code style files should be backuped before copying new ones|
