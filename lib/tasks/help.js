'use strict';

const yargs = require('yargs');

function generate(gulp, config, gulptraum) {

  gulp.task('help', () => {

    const taskName = yargs.argv.task || '';

    const helpCommandString = ['help'].concat(taskName)
      .join(' ')
      .trim();

    gulptraum.cli.exec(helpCommandString);
  });
}

module.exports.generate = generate;
module.exports.name = 'help';
module.exports.help = 'Shows the help.';
module.exports.excludeTaskFromCli = true;
