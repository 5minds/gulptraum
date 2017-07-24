import * as yargs from 'yargs';

function generate(gulp, config, gulptraum) {

  gulp.task('help', () => {

    const taskName = yargs.argv.task || '';

    const helpCommandString = ['help'].concat(taskName)
      .join(' ')
      .trim();

    gulptraum.cli.exec(helpCommandString);
  });
}

export const command = {
  generate: generate,
  name: 'help',
  help: 'Shows the help.',
  excludeTaskFromCli: true,
};
