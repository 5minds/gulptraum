import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'gulp-shell';

function generate(gulp, config, gulptraum) {

  gulp.task('release', () => {
  
    const releasePnpBuildCommand = ((config && config.releasePnpBuildCommand) || 'gulp build');
    const releasePnpDevBranch = ((config && config.releasePnpDevBranch) || 'develop');
    const releasePnpProdBranch = ((config && config.releasePnpProdBranch) || 'master');
  
    gulp.task('release', shell.task([
      'PNP_DEVBRANCH=' + releasePnpDevBranch + ' PNP_PRODBRANCH=' + releasePnpProdBranch + ' PNP_BUILDCOMMAND="' + releasePnpBuildCommand + '" sh ' + path.resolve(__dirname, 'scripts/patch-n-publish.sh')
    ]));
  });
}

export const command = {
  generate: generate,
  name: 'release',
  help: 'Synchronises develop into master, bumps version and publishes to npm registry.',
};
