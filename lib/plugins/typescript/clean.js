'use strict';

const del = require('del');
const vinylPaths = require('vinyl-paths');
const path = require('path');
const runSequence = require('run-sequence');

function generate(gulp, config) {

  const outputFolderPath = path.relative(config.paths.root, config.paths.output);

  gulp.task('build-typescript-clean', () => {
    // TODO: make use of excludes provided in the config
    return gulp.src(`${outputFolderPath}**/*.js`)
      .pipe(vinylPaths(del));
  });

  gulp.task('clean-typescript', (callback) => {

    const runSequenceWithGulp = runSequence.use(gulp);
    return runSequenceWithGulp(
      'build-typescript-clean',
      'test-typescript-clean',
      'doc-typescript-clean',
      callback
    );
  });

}

module.exports.generate = generate;
