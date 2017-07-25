define(["require", "exports", "yargs"], function (require, exports, yargs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function generate(gulp, config, gulptraum) {
        gulp.task('help', () => {
            const taskName = yargs.argv.task || '';
            const helpCommandString = ['help'].concat(taskName)
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
});

//# sourceMappingURL=help.js.map
