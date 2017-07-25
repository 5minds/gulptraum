"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vorpal = require("vorpal");
function generate(gulp, config, gulptraum) {
    gulp.task('cli', function (callback) {
        gulptraum.cli.on('vorpal_exit', function () {
            gulptraum.cli.ui.log('');
            callback();
        });
        gulptraum.cli.delimiter(vorpal().chalk.bold.yellow('gulptraum'))
            .show();
        gulptraum.cli.ui.log('');
        gulptraum.cli.ui.log('type "help" to view available commands');
        gulptraum.cli.ui.log('');
    });
}
exports.command = {
    generate: generate,
    name: 'cli',
    help: 'Starts the gulptraum cli.',
};

//# sourceMappingURL=cli.js.map
