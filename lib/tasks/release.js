'use strict';

const fs = require('fs');
const path = require('path');
const shell = require('gulp-shell');

function generate(gulp, config, cli) {

  const releasePnpBuildCommand = ((config && config.releasePnpBuildCommand) || 'gulp build');
  const releasePnpDevBranch = ((config && config.releasePnpDevBranch) || 'develop');
  const releasePnpProdBranch = ((config && config.releasePnpProdBranch) || 'master');

  gulp.task('release', shell.task([
    'PNP_DEVBRANCH=' + releasePnpDevBranch + ' PNP_PRODBRANCH=' + releasePnpProdBranch + ' PNP_BUILDCOMMAND="' + releasePnpBuildCommand + '" sh ' + path.resolve(__dirname, 'scripts/patch-n-publish.sh')
  ]));
}

module.exports.generate = generate;
module.exports.name = 'release';
module.exports.help = 'Synchronises develop into master, bumps version and publishes to npm registry.';
