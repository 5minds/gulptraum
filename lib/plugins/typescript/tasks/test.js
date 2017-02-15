'use strict';

const fs = require('fs');
const del = require('del');
const vinylPaths = require('vinyl-paths');
const path = require('path');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');
const compilerTsOptions = require('./../setup/typescript-options');

function generate(gulp, config, gulptraum) {

  // we need to create a symlink that lists the package we want to test in its own node_modules
  // this is necessary to be able to use the following syntax inside a unit test:
  // import {someExportOfThePackageWeAreWorkingOn} from 'thePackageWeAreWorkingOn';
  const currentPath = path.resolve(config.paths.root);
  const symlinkTargetPath = path.resolve(`${config.paths.root}/node_modules/${config.packageName}`);

  const symlinkExists = fs.existsSync(symlinkTargetPath);

  if (!symlinkExists) {
    fs.symlinkSync(currentPath, symlinkTargetPath, 'junction');
  }

  compilerTsOptions.initializeTypeScriptOptions(config);

  const testsFolderPath = path.resolve(config.paths.root, config.paths.tests);
  const sourceOutputFolderPath = path.resolve(config.paths.root, config.paths.output);
  const testsOutputFolderPath = path.resolve(config.paths.root, config.paths.testOutput);
  const typingsGlobPath = path.resolve(config.paths.root, config.paths.typings);

  gulptraum.task('test-typescript-build', {
    help: 'Builds your TypeScript test source code'
  }, () => {

    const tsProject = ts.createProject(
      compilerTsOptions.getTypeScriptOptions({
        target: 'es5',
        sourceMap: true,
        module: 'commonjs',
        moduleResolution: 'node',
        listFiles: true,
        listEmittedFiles: true,
      }));

    const allTestFiles = [
      `${testsFolderPath}/**/*.ts`,
      `${testsFolderPath}/**/*.d.ts`,
      `${sourceOutputFolderPath}/**/*.d.ts`,
      `${typingsGlobPath}`,
    ];

    const tsResult = gulp.src(allTestFiles)
      .pipe(tsProject(ts.reporter.fullReporter(true)));

    return tsResult.js
      .pipe(gulp.dest(`${testsOutputFolderPath}`));
  });

  gulptraum.task('test-typescript-run', {
    help: 'Runs all TypeScript tests built be the TypeScript plugin'
  }, () => {
    return gulp.src(`${testsOutputFolderPath}/**/*.js`)
      .pipe(mocha())
      .once('error', (error) => {
        console.error(error);
        process.exit(1);
      });
  });

  gulptraum.task('test-typescript-clean', {
    help: 'Cleans all test files built by the TypeScript plugin'
  }, () => {
    return gulp.src(`${testsOutputFolderPath}`)
      .pipe(vinylPaths(del));
  });

  gulptraum.task('test-typescript', {
    help: 'Runs all TypeScript tests'
  }, (callback) => {

    const runSequenceWithGulp = runSequence.use(gulp);
    runSequenceWithGulp(
      'test-typescript-build',
      'test-typescript-run',
      // TODO: make sure clean is executed if errors occur during runtime
      'test-typescript-clean',
      callback
    );
  });

}

module.exports.generate = generate;
