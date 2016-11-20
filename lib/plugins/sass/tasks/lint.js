'use strict';

const fs = require('fs');
const path = require('path');
const sasslint = require('gulp-sass-lint');

function generate(gulp, config, gulptraum) {

  gulptraum.task('lint-sass', {
    help: 'Performs a style check on your SASS files using sass-lint'
  }, (callback) => {

    let sassLintConfigPath = config.paths.sasslintConfig;

    if (!sassLintConfigPath) {
      sassLintConfigPath = path.resolve(__dirname, '../setup/sass-lint.yml');
    }

    return gulp.src(config.paths.source)
      .pipe(sasslint({
        options: {
          'config-file': sassLintConfigPath,
        },
      }))
      .pipe(sasslint.format())
      .pipe(sasslint.failOnError());
  });
}

module.exports.generate = generate;
