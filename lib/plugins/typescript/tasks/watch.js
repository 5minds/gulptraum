'use strict';

const path = require('path');
const yargs = require('yargs');

function generate(gulp, config, gulptraum) {

  const sourceFolderPath = path.resolve(config.paths.root, config.paths.source);



  gulptraum.task('watch-typescript', {
    help: 'Watch TypeScript source code for changes and executes a certain task on change'
  }, function watchTypescript() {
    const argv = yargs.argv;
    const taskArgument = (argv.task || 'build-typescript').toLowerCase();

    return gulp.watch(sourceFolderPath, [taskArgument]);
  });

}

module.exports.generate = generate;
