import * as del from 'del';
import * as vinylPaths from 'vinyl-paths';
import * as path from 'path';

export function generate(gulp, config, gulptraum): void {

  // const outputFolderPath = path.resolve(config.paths.root, config.paths.output);

  gulp.task('copy', (callback) => {

    for (const copySource in config.copy) {

      const copyTarget = config.copy[copySource];

      console.log(`copy from '${copySource}' to '${copyTarget}'`);

      gulp.src(copySource)
        .pipe(gulp.dest(copyTarget));
    }

    return callback();

  });

}

export const command = {
  generate: generate,
  name: 'copy',
  help: 'Copies specified files',
  excludeTaskFromCli: true,
};