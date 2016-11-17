'use strict';

const path = require('path');
const sass = require('gulp-sass');

var rename = require('gulp-rename');
function generate(gulp, config) {

  const outputFolderPath = path.relative(config.paths.root, config.paths.output);

  gulp.task('build-sass', (callback) => {
    return gulp.src(config.paths.source)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(outputFolderPath));
  });
}

module.exports.generate = generate;
