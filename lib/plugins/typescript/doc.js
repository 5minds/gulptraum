'use strict';

const typedoc = require('gulp-typedoc');
const runSequence = require('run-sequence');
const through2 = require('through2');

function generate(gulp, config) {

  gulp.task('doc-typescript-generate', function docTypescriptGenerate() {
    return gulp.src([`${config.paths.output}${config.packageName}.d.ts`])
      .pipe(typedoc({
        target: 'es6',
        includeDeclarations: true,
        moduleResolution: 'node',
        json: `${config.paths.doc}/api.json`,
        name: `${config.packageName}-docs`,
        mode: 'modules',
        excludeExternals: true,
        ignoreCompilerErrors: false,
        version: true,
      }));
  });

  gulp.task('doc-typescript-shape', function docTypescriptShape() {
    return gulp.src([`${config.paths.doc}/api.json`])
      .pipe(through2.obj((file, enc, callback) => {
        let json = JSON.parse(file.contents.toString('utf8')).children[0];

        json = {
          name: config.packageName,
          children: json.children,
          groups: json.groups
        };

        file.contents = new Buffer(JSON.stringify(json));
        this.push(file);
        return callback();
      }))
      .pipe(gulp.dest(config.paths.doc));
  });

  gulp.task('doc-typescript', function docTypescript(callback) {

    const runSequenceWithGulp = runSequence.use(gulp);
    return runSequenceWithGulp(
      'doc-typescript-generate',
      'doc-typescript-shape',
      callback
    );
  });

}

module.exports.generate = generate;
