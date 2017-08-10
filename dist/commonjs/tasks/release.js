"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var shell = require("gulp-shell");
var yargs = require('yargs');
function generate(gulp, config, gulptraum) {
    gulp.task('release', function () {
        var releasePnpBuildCommand = ((config && config.releasePnpBuildCommand) || 'gulp build');
        var releasePnpDevBranch = ((config && config.releasePnpDevBranch) || 'develop');
        var releasePnpProdBranch = ((config && config.releasePnpProdBranch) || 'master');
        var versioningMethod = '';
        var argv = yargs.argv;
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
exports.command = {
    generate: generate,
    name: 'release',
    help: 'Synchronises develop into master, bumps version and publishes to npm registry. Usage: gulp [--bumpMode=<patch|minor|major>:default=patch] [--devBranch=<nameOfDevelopmentBranch>:default=develop] [--prodBranch=<nameOfProductionBranch>:default=master] [--buildCommand=<commandToBuild>:default=\'gulp build\'] release',
};

//# sourceMappingURL=release.js.map
