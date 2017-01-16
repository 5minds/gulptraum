'use strict';

const runSequence = require('run-sequence');
const ts = require('gulp-typescript');
const compilerTsOptions = require('./../setup/typescript-options');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
const through = require('through2');

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
      const tsProject = ts.createProject(
        compilerTsOptions.getTypeScriptOptions({
          module: moduleType,
          target: moduleType === 'es2015' ? 'es2015' : 'es5'
        }));


        function prefixSources(prefix) {
        function workit(file, encoding, callback) {
console.log(file.sourceMap);
            if (file.sourceMap) {

              for(let i = 0; i < file.sourceMap.sources.length; i++) {
                const source = file.sourceMap.sources[i];
                file.sourceMap.sources[i] = prefix + source;
              }

            }

            this.push(file);
            return callback();
        }

        return through.obj(workit);
    }

      const sourceMapOptions = {
        // sourceRoot: function (file) {
        //   const test = '../../src';
        //   console.log(test);
        //   return test;
        // },
        mapSources: function(sourcePath) {
          // source paths are prefixed with '../src/'
          return '../../src/' + sourcePath;
        },
        includeContent: true,
        destPath: './'
      };

      const writeOptions = {
        includeContent: true,
  // point to the root of the project
  sourceRoot: function (file) {
  return config.paths.source;
  }
      }

      const tsResult = srcForTypeScript()
        .pipe(sourcemaps.init())
        .pipe(tsProject(ts.reporter.fullReporter(true)));

      return tsResult.js
        // .pipe(prefixSources('../../src/'))
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
