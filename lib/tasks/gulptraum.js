'use strict';

function generate(gulp, config, gulptraum) {

  gulp.task('gulptraum', () => {

    gulptraum.cli.delimiter('gulptraum')
      .show();
  });
}

module.exports.generate = generate;
module.exports.name = 'gulptraum';
module.exports.help = 'Starts the gulptraum cli.';
