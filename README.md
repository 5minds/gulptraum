# Gulptraum

A simple-to-use build system based on gulp.

## Introduction

Gulptraum is a build system you can configure using a fluent syntax.
You can configure the technologies you would like to work with and optionally provide additional configuration for each technology.

Gulptraum will then make sure the corresponding gulp tasks are automatically generated when the gulpfile.js is used (that is when you run a gulp command).

So by configuring Gulptraum you get to use a collection of gulp tasks that take care of the typical work you want the task runner to take care of.

## Usage

The following code snippet shows an example `gulpfile.js`.

```javascript

const gulptraum = require('@5minds/gulptraum');
const gulp = require('gulp');


const buildSystemConfig = {
  paths: {
    root: '.',
    source: 'src/',
    output: 'dist/'
  },
  packageName: 'state-board'
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

```
gulp build
```

## Convention

To have a common structure for naming gulp tasks we have defined a naming convention Gulptraum enforces.

There are top level tasks that are automatically generated for you:
* build
* clean
* test

Each of these top level tasks has technology specific sub tasks:
* build-typescript
* build-sass

And each of those sub tasks can utilize additional subtasks it needs to do its job:
* build-typescript-index
* build-typescript-commonjs

This is important for you to know if you want to provide additional gulp tasks that are not part of the build system. If you would use a name that the build system already used for one of its tasks then you would overwrite the existing task and most likely get nasty side effects.

As you can see the generated tasks are written in param case, start with a top level task and get more specific with each level of subtasks.
The convention in that reads as follows:

***{top-level-task} - {technology} - {technology-task}***

## Configuration

Gulptraum provides default configurations for all technologies it supports.

However you can overwrite each configuration completely to customize the behavior to your needs.

### Global

The global configuration defines the main paths for your application. These paths are also used in the technology-specific default configurations.

| Setting | Type | Description |
|---|---|---|
|paths|Object|Contains global application paths|
|paths.root|String|Your application root path (all other paths are relative to this path)|
|paths.source|String|Glob pattern for your source files|
|paths.output|String|The output directory for build tasks|
|paths.excludes|Array of Strings |Glob patterns to exclude from sources|
|packageName|String|The name of your application|
|sort|Boolean|True if contents should be merged in alphabetical order|

### Technology-specific

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
### clean
### test
### TODO_doc
### TODO_lint
### TODO_prepare-release
### TODO_setup-dev

## Technologies

### TypeScript
