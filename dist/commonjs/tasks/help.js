"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
function generate(gulp, config, gulptraum) {
    gulp.task('help', function () {
        var taskName = yargs.argv.task || '';
        var helpCommandString = ['help'].concat(taskName)
            .join(' ')
            .trim();
        gulptraum.cli.exec(helpCommandString);
    });
}
exports.command = {
    generate: generate,
    name: 'help',
    help: 'Shows the help.',
    excludeTaskFromCli: true,
};

//# sourceMappingURL=help.js.map
