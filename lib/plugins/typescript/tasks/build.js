'use strict';

const runSequence = require('run-sequence');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const compilerTsOptions = require('./../setup/typescript-options');

function generate(gulp, config, gulptraum) {

  const jsName = `${config.packageName}.ts`;
  compilerTsOptions.initializeTypeScriptOptions(config);

  function srcForTypeScript() {
    const allSourceFiles = [config.paths.source, config.paths.typings];
    return gulp
      .src(allSourceFiles);
  }

  config.compileToModules.forEach((moduleType) => {

    gulptraum.task(`build-typescript-${moduleType}`, {
      help: `Builds the TypeScript source code into a ${moduleType} module`,
    }, () => {
        const options = compilerTsOptions.getTypeScriptOptions({
          module: moduleType,
          target: (config && config.compilerOptions && config.compilerOptions.target) ? config.compilerOptions.target : 'es5'
        });
      const tsProject = ts.createProject(options);
      const tsResult = srcForTypeScript()
        .pipe(sourcemaps.init())
        .pipe(tsProject(ts.reporter.fullReporter(true)));

      return tsResult.js
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../../src'}))
        .pipe(gulp.dest(config.paths.output + moduleType));
    });
  });

  gulptraum.task('build-typescript-dts', {
    help: 'Generates the type definitions (.d.ts) file from your TypeScript source code',
  }, () => {
    const tsProject = ts.createProject(
      compilerTsOptions.getTypeScriptOptions({
        removeComments: false,
        target: 'es2015',
        module: 'es2015',
      }));
    const tsResult = srcForTypeScript()
      .pipe(tsProject(ts.reporter.fullReporter(true)));
    return tsResult.dts
      .pipe(gulp.dest(config.paths.output));
  });

  gulptraum.task('build-typescript', {
    help: 'Builds your TypeScript source code and generates the type definitions',
  }, (callback) => {
    return runSequence.use(gulp)(
      config.compileToModules
      .filter((moduleType) => {
        return moduleType !== 'native-modules';
      })
      .map((moduleType) => {
        return `build-typescript-${moduleType}`;
      })
      .concat(config.useTypeScriptForDTS ? ['build-typescript-dts'] : []),
      callback
    );
  });

}

module.exports.generate = generate;
