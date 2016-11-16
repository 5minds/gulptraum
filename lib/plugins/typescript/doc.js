'use strict';

const path = require('path');
const del = require('del');
const vinylPaths = require('vinyl-paths');
const typedoc = require('gulp-typedoc');
const runSequence = require('run-sequence');
const through2 = require('through2');

function generate(gulp, config) {

  const docsOutputFolderPath = path.resolve(config.paths.root, config.paths.doc);
  const sourceOutputFolderPath = path.resolve(config.paths.root, config.paths.output);

  gulp.task('doc-typescript-generate', function docTypescriptGenerate() {
    return gulp.src([`${sourceOutputFolderPath}/${config.packageName}.d.ts`])
      .pipe(typedoc({
        target: 'es6',
        includeDeclarations: true,
        moduleResolution: 'node',
        json: `${config.paths.doc}/api.json`,
        out: `${config.paths.doc}/`,
        name: `${config.packageName}-docs`,
        mode: 'modules',
        excludeExternals: true,
        ignoreCompilerErrors: false,
        version: true,
      }));
  });

  gulp.task('doc-typescript-shape', function docTypescriptShape() {
    return gulp.src([`${docsOutputFolderPath}/api.json`])
      .pipe(through2.obj(function(file, enc, callback) {
        let originalApiContent = JSON.parse(file.contents.toString('utf8')).children[0];

        originalApiContent = {
          name: config.packageName,
          children: originalApiContent.children,
          groups: originalApiContent.groups,
        };

        file.contents = new Buffer(JSON.stringify(originalApiContent));
        this.push(file);
        return callback();
      }))
      .pipe(gulp.dest(docsOutputFolderPath));
  });

  gulp.task('doc-typescript-clean', () => {
    return gulp.src(`${docsOutputFolderPath}`)
      .pipe(vinylPaths(del));
  });

  gulp.task('doc-typescript', function docTypescript(callback) {

    const runSequenceWithGulp = runSequence.use(gulp);
    return runSequenceWithGulp(
      'doc-typescript-clean',
      'doc-typescript-generate',
      'doc-typescript-shape',
      callback
    );
  });

}

module.exports.generate = generate;
