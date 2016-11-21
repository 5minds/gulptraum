'use strict';

const path = require('path');
const sass = require('gulp-sass');

function generate(gulp, config, gulptraum) {

  const outputFolderPath = path.resolve(config.paths.root, config.paths.output);

  gulptraum.task('build-sass', {
    help: 'Builds your sass files into css'
  }, (callback) => {
    return gulp.src(config.paths.source)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(outputFolderPath));
  });
}

module.exports.generate = generate;
