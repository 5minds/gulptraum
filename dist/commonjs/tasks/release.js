"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var shell = require("gulp-shell");
function generate(gulp, config, gulptraum) {
    gulp.task('release', function () {
        var releasePnpBuildCommand = ((config && config.releasePnpBuildCommand) || 'gulp build');
        var releasePnpDevBranch = ((config && config.releasePnpDevBranch) || 'develop');
        var releasePnpProdBranch = ((config && config.releasePnpProdBranch) || 'master');
        gulp.task('release', shell.task([
            'PNP_DEVBRANCH=' + releasePnpDevBranch + ' PNP_PRODBRANCH=' + releasePnpProdBranch + ' PNP_BUILDCOMMAND="' + releasePnpBuildCommand + '" sh ' + path.resolve(__dirname, 'scripts/patch-n-publish.sh')
        ]));
    });
}
exports.command = {
    generate: generate,
    name: 'release',
    help: 'Synchronises develop into master, bumps version and publishes to npm registry.',
};

//# sourceMappingURL=release.js.map
