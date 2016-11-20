'use strict';

function generate(gulp, config, cli) {

  gulp.task('gulptraum', () => {

    cli.show();
  });
}

module.exports.generate = generate;
module.exports.name = 'gulptraum';
module.exports.help = 'Starts the gulptraum cli.';
