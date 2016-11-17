'use strict';

const del = require('del');
const vinylPaths = require('vinyl-paths');
const path = require('path');
const runSequence = require('run-sequence');

function generate(gulp, config) {

  const outputFolderPath = path.relative(config.paths.root, config.paths.output);

  gulp.task('build-sass-clean', () => {
    // TODO: make use of excludes provided in the config
    return gulp.src(`${outputFolderPath}/**/*.css`)
      .pipe(vinylPaths(del));
  });

  gulp.task('clean-sass', (callback) => {

    const runSequenceWithGulp = runSequence.use(gulp);
    return runSequenceWithGulp(
      'build-sass-clean',
      callback
    );
  });

}

module.exports.generate = generate;
