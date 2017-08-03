"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generate(gulp, config, gulptraum) {
    gulp.task('copy', function (callback) {
        for (var copySource in config.copy) {
            var copyTarget = config.copy[copySource];
            console.log("copy from '" + copySource + "' to '" + copyTarget + "'");
            gulp.src(copySource)
                .pipe(gulp.dest(copyTarget));
        }
        return callback();
    });
}
exports.generate = generate;
exports.command = {
    generate: generate,
    name: 'copy',
    help: 'Copies specified files',
    excludeTaskFromCli: true,
};

//# sourceMappingURL=copy.js.map
