'use strict';

const path = require('path');
const tslint = require('gulp-tslint');

const tslintDefaultConfiguration = require('./tslint.json');

function generate(gulp, config) {

  const sourceFolderPath = path.resolve(config.paths.root, config.paths.source);

  gulp.task('lint-typescript', function lintTypescript() {

    let tslintConfiguration = tslintDefaultConfiguration;

    if (config.paths.tslintConfig) {
      tslintConfiguration = require(config.paths.tslintConfig);
    }

    return gulp.src(sourceFolderPath)
      .pipe(tslint({
        formatter: 'prose',
        summarizeFailureOutput: true,
        configuration: tslintConfiguration,
      }))
      .pipe(tslint.report({
        // emitError: false
      }));
  });

}

module.exports.generate = generate;
