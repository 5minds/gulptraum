import * as path from 'path';
import * as shell from 'gulp-shell';
const yargs = require('yargs');

function generate(gulp, config, gulptraum) {

  gulp.task('release', () => {

    let releasePnpBuildCommand = ((config && config.releasePnpBuildCommand) || 'gulp build');
    let releasePnpDevBranch = ((config && config.releasePnpDevBranch) || 'develop');
    let releasePnpProdBranch = ((config && config.releasePnpProdBranch) || 'master');
    let versioningMethod = '';

    const argv = yargs.argv;
    if (argv && argv.devBranch) {
      releasePnpDevBranch = argv.devBranch;
    }
    if (argv && argv.prodBranch) {
      releasePnpProdBranch = argv.prodBranch;
    }
    if (argv && argv.buildCommand) {
      releasePnpBuildCommand = argv.buildCommand;
    }
    if (argv && argv.bumpMode) {
      versioningMethod = ' ' + argv.bumpMode;
      if (argv.bumpMode.indexOf('pre') === 0) {
        releasePnpDevBranch = '';
        releasePnpProdBranch = '';
      }
    }

    gulp.task('release', shell.task([
      'PNP_DEVBRANCH=' + releasePnpDevBranch + ' PNP_PRODBRANCH=' + releasePnpProdBranch + ' PNP_BUILDCOMMAND="' + releasePnpBuildCommand + '" sh ' + path.resolve(__dirname, '../../../scripts/patch-n-publish.sh' + versioningMethod)
    ]));
  });
}

export const command = {
  generate: generate,
  name: 'release',
  help: 'Synchronises develop into master, bumps version and publishes to npm registry.',
};
