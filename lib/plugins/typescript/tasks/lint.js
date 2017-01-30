'use strict';

const path = require('path');
const tslint = require('gulp-tslint');

const tslintDefaultConfiguration = require('./../setup/tslint.json');

function generate(gulp, config, gulptraum) {

  const sourceFolderPath = path.resolve(config.paths.root, config.paths.source);

  gulptraum.task('lint-typescript', {
    help: 'Performs a style check on your TypeScript source code using TSLint'
  }, function lintTypescript() {

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