'use strict';

const runSequence = require('run-sequence');
const assign = Object.assign || require('object.assign'); // eslint-disable-line
const through2 = require('through2');
const concat = require('gulp-concat');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const tools = require('aurelia-tools');
const ts = require('gulp-typescript');
const gutil = require('gulp-util');
const gulpIgnore = require('gulp-ignore');
const compilerTsOptions = require('./typescript-options');
const merge = require('merge2');
const path = require('path');
const dag = require('breeze-dag');
const Stream = require('stream');

const compileToModules = ['es2015', 'commonjs', 'amd', 'system'];

function generate(gulp, config) {

  const jsName = `${config.packageName}.ts`;
  compilerTsOptions.initializeTypeScriptOptions(config);

  function cleanGeneratedCode() {
    return through2.obj(function pipelineHook(file, enc, callback) {
      const fileContents = file.contents.toString('utf8');
      const cleanedCode = tools.cleanGeneratedCode(fileContents);
      file.contents = new Buffer(cleanedCode); // eslint-disable-line
      this.push(file);
      return callback();
    });
  }

  const relativeImports = /import\s*{[a-zA-Z0-9_\$\,\s]+}\s*from\s*'(\.[^\s']+)';\s*/g; // eslint-disable-line

  function sortFiles() {
    const edges = [];
    const files = {};

    function getImports(file) {
      const contents = file.contents;
      const deps = [];
      let match;

      while (match = relativeImports.exec(contents)) { // eslint-disable-line
        deps.push(path.relative(file.base, path.resolve(path.dirname(file.path), `${match[1]}.ts`)));
      }

      return deps;
    }

    function bufferFile(file, enc, callback) {
      let imports = getImports(file);
      if (!imports.length) {
        // include a null dependency so disconnected nodes will be included in the DAG traversal
        imports = [null];
      }

      imports.forEach((dependency) => {
        edges.push([dependency, file.relative]);
      });

      files[file.relative] = file;
      callback();
    }

    function endStream(callback) {
      const self = this;

      dag(edges, 1, (filePath, next) => {
        self.push(files[filePath]);
        next();
      }, callback);
    }

    return through2.obj(bufferFile, endStream);
  }

  gulp.task('build-typescript-index', () => {
    const importsToAdd = config.importsToAdd.slice();

    let src = gulp.src(config.paths.source);
    // let src = gulp.src([config.paths.source, config.paths.typings]);

    if (config.sort) {
      src = src.pipe(sortFiles());
    }

    if (config.paths.excludes) {

      const excludes = Array.isArray(config.paths.excludes) ? config.paths.excludes : [config.paths.excludes];

      excludes.forEach((filename) => {
        src = src.pipe(gulpIgnore.exclude(filename));
      });
    }

    return src.pipe(through2.obj(function pipelineHook(file, enc, callback) {
        const fileContents = file.contents.toString('utf8');
        const extractedImports = tools.extractImports(fileContents, importsToAdd);
        file.contents = new Buffer(extractedImports);
        this.push(file);
        return callback();
      }))
      .pipe(concat(jsName))
      .pipe(insert.transform((contents) => {
        return tools.createImportBlock(importsToAdd) + contents;
      }))
      .pipe(gulp.dest(config.paths.output));
  });

  function gulpFileFromString(filename, string) {
    const src = Stream.Readable({
      objectMode: true,
    });
    src._read = function readHook() {
      this.push(new gutil.File({
        cwd: config.paths.root,
        base: config.paths.output,
        path: filename,
        contents: new Buffer(string)
      }));
      this.push(null);
    };
    return src;
  }

  function srcForTypeScript() {
    const sourceMainTsFile = `${config.paths.output}${config.packageName}.ts`;
    const allSourceFiles = [sourceMainTsFile, config.paths.typings];
    return gulp
      .src(allSourceFiles)
      .pipe(rename((filePath) => {
        if (filePath.extname === '.js') {
          filePath.extname = '.ts';
        }
      }));
  }

  compileToModules.forEach((moduleType) => {

    gulp.task(`build-typescript-${moduleType}`, () => {
      const tsProject = ts.createProject(
        compilerTsOptions.getTypeScriptOptions({
          module: moduleType,
          target: moduleType === 'es2015' ? 'es2015' : 'es5'
        }));
      const tsResult = srcForTypeScript()
        .pipe(tsProject(ts.reporter.fullReporter(true)));

      return tsResult.js
        .pipe(gulp.dest(config.paths.output + moduleType));
    });
  });

  gulp.task('build-typescript-dts', () => {
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

  gulp.task('build-typescript', (callback) => {
    return runSequence.use(gulp)(
      'clean-typescript',
      'build-typescript-index',
      compileToModules
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
