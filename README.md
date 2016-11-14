# Gulptraum

A simple-to-use build system based on gulp.

# Features

```

* Fluent Declaration Syntax for your gulpfile.js

* Plugins for popular technologies that provide all tasks you need like
   * build   * test   * clean   * doc   * lint

* Default Configurations for an easy setup

* Technologies supported:
  * TypeScript 2

```
## Introduction

Gulptraum is a build system you can configure using a fluent syntax.
You can configure the technologies you would like to work with and optionally provide additional configuration for each plugin.

Gulptraum will then make sure the corresponding gulp tasks are automatically generated when the gulpfile.js is used (that is when you run a gulp command).

So by configuring Gulptraum you get to use a collection of gulp tasks that take care of the typical work you want the task runner to take care of.

## Usage

The following code snippet shows an example `gulpfile.js`.

```javascript

const gulptraum = require('gulptraum');
const gulp = require('gulp');


const buildSystemConfig = {
  paths: {
    root: '.',
    source: 'src/',
    output: 'dist/'
  },
  packageName: 'your-npm-package-name'
};

const buildSystem = new gulptraum.BuildSystem(buildSystemConfig);


const typeScriptConfig = {
  paths: {
    typings: 'typings/**/*.d.ts'
  }
};


buildSystem
  .registerPlugin('typescript', gulptraum.plugins.typescript, typeScriptConfig)
  .registerTasks(gulp);
```

With this `gulpfile.js` in your project folder you can just run the following to build your typescript:

```shell
gulp build

[14:47:09] Using gulpfile ~/_dev/some-project/gulpfile.js
[14:47:09] Starting 'build'...
[14:47:09] Starting 'clean'...
[14:47:09] Starting 'test-typescript-clean'...
[14:47:09] Finished 'test-typescript-clean' after 10 ms
[14:47:09] Starting 'clean-typescript'...
[14:47:09] Finished 'clean-typescript' after 3.05 ms
[14:47:09] Finished 'clean' after 15 ms
[14:47:09] Starting 'build-typescript'...
[14:47:09] Starting 'test-typescript-clean'...
[14:47:09] Finished 'test-typescript-clean' after 695 μs
[14:47:09] Starting 'clean-typescript'...
[14:47:09] Finished 'clean-typescript' after 1.04 ms
[14:47:09] Starting 'build-typescript-index'...
[14:47:09] Finished 'build-typescript-index' after 22 ms
[14:47:09] Starting 'build-typescript-es2015'...
[14:47:09] Starting 'build-typescript-commonjs'...
[14:47:09] Starting 'build-typescript-amd'...
[14:47:09] Starting 'build-typescript-system'...
[14:47:09] Starting 'build-typescript-dts'...
[14:47:14] Finished 'build-typescript-amd' after 4.81 s
[14:47:14] Finished 'build-typescript-commonjs' after 4.82 s
[14:47:14] Finished 'build-typescript-dts' after 4.81 s
[14:47:14] Finished 'build-typescript-system' after 4.81 s
[14:47:14] Finished 'build-typescript-es2015' after 4.82 s
[14:47:14] Finished 'build-typescript' after 4.85 s
[14:47:14] Finished 'build' after 4.86 s
```

## Plugins

Gulptraum is extensible through plugins that provide gulp tasks for particular technologies.

Currently Gulptraum only brings its own plugin for providing TypeScript gulp tasks, but we plan to provide more plugins out of the box.

If you want to use gulptraum to provide special tasks that are not provided yet you can write your own plugins.

Your plugins need to provide two exports to work with Gulptraum:

* getDefaultConfig(buildSystemConfig)
* initializePlugin(gulp, config)

You can use these to register your own tasks.

Please read about the Conventions and Configuration concept of Gulptraum before implementing your plugins to make the most use out of it.

## Convention

To have a common structure for naming gulp tasks we have defined a naming convention Gulptraum enforces.

There are top level tasks that are automatically generated for you:
* build
* clean
* test

Each of these top level tasks has plugin specific sub tasks:
* build-typescript
* build-sass

And each of those sub tasks can utilize additional subtasks it needs to do its job:
* build-typescript-index
* build-typescript-commonjs

This is important for you to know if you want to provide additional gulp tasks that are not part of the build system. If you would use a name that the build system already used for one of its tasks then you would overwrite the existing task and most likely get nasty side effects.

As you can see the generated tasks are written in param case, start with a top level task and get more specific with each level of subtasks.
The convention in that reads as follows:

***{top-level-task} - {plugin} - {plugin-task}***

## Configuration

Gulptraum provides default configurations for all technologies it supports.

However you can overwrite each configuration completely to customize the behavior to your needs.

### Global

The global configuration defines the main paths for your application. These paths are also used in the plugin-specific default configurations.

| Setting | Type | Description |
|---|---|---|
|paths|Object|Contains global application paths|
|paths.root|String|Your application root path (all other paths are relative to this path)|
|paths.source|String|Glob pattern for your source files|
|paths.output|String|The output directory for build tasks|
|paths.excludes|Array of Strings |Glob patterns to exclude from sources|
|packageName|String|The name of your application|
|sort|Boolean|True if contents should be merged in alphabetical order|

### Plugin-specific

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

#### TypeScript

| Setting | Type | Description |
|---|---|---|
|paths|Object|Contains global application paths|
|paths.root|String|Your application root path (all other paths are relative to this path)|
|paths.source|String|Glob pattern for your source files|
|paths.typings|String|Glob pattern for your type definition files|
|paths.output|String|The output directory for build tasks|
|paths.excludes|Array of Strings |Glob patterns to exclude from sources|
|packageName|String|The name of your application|
|sort|Boolean|True if contents should be merged in alphabetical order|
|useTypeScriptForDTS|Boolean|True if type definitions should be generated from your TypeScript files|
|importsToAdd|Array of Strings|Resources you additionally want to require in your built code|


## Top Level Tasks

### build

The `build` task is used to perform all compilation tasks your project requires to run.

It runs the `clean` task before it starts.

The application code is compiled to the folder `dist` by default.

### clean

The `clean` task erases all files and folders generated by the `build` and the `test` task.

### test

The `test` task is used to run all tests you implemented in your project.

It runs the `build` task before it starts to ensure you actually test your latest code.

Some test tasks might need to compile special test code that you don't want to mix up with your compiled application code. The `test` task of the `typescript` plugin for example (called `test-typescript`) needs to build the `.ts` files of your tests. These are compiled to the folder `dist-test` by default while the application code is compiled to `dist` by default.

### TODO_doc

The `doc` task is meant to generate all documentation you provided for your project.

This task is not yet implemented.

### TODO_lint

The `doc` task is meant to run all style checks that are provided by the plugins you configure to use.

This task is not yet implemented.

### TODO_prepare-release

The `prepare-release` task is meant to perform automated steps you want to perform before publishing a release.

This task is not yet implemented.

### TODO_setup-dev

The `setup-dev` task is meant to copy all code style files appropriate for the plugins you configure to use to your project root folder.

This task is not yet implemented.

## Plugins

Currently gulptraum only provides one plugin for using TypeScriptv2. We intend to implement more and more as we progress with the frameworks vision.

If you want to contribute gulp tasks you successfully use in your projects or want to learn details about the implementation of plugins - don't hesitate to contact us or open a pull request.

### TypeScript
