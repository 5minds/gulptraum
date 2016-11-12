'use strict';

const del = require('del');
const vinylPaths = require('vinyl-paths');
const path = require('path');

function generate(gulp, config) {
  gulp.task('clean-typescript', ['test-typescript-clean'], () => {
    // TODO: make use of excludes provided in the config
    const outputFolderPath = path.relative(config.paths.root, config.paths.output);
    // return gulp.src(`${config.paths.output}**/*.{ts,js}`)
    return gulp.src(`${outputFolderPath}**/*.js`)
      .pipe(vinylPaths(del));
  });

}

module.exports.generate = generate;
