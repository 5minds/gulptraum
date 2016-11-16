'use strict';

const fs = require('fs');
const path = require('path');
const sasslint = require('gulp-sass-lint');

function generate(gulp, config) {

  gulp.task('lint-sass', (callback) => {

    let sassLintConfigPath = config.paths.sasslintConfig;

    if (!sassLintConfigPath) {
      sassLintConfigPath = path.resolve(__dirname, 'sass-lint.yml');
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
