"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var fs = require("fs");
var path = require("path");
var bump = require("gulp-bump");
var conventionalChangelog = require("gulp-conventional-changelog");
function generate(gulp, config, gulptraum) {
    gulp.task('prepare-release-generate-changelog', function prepareRelease() {
        var changelogPath = path.resolve(config.paths.changelog);
        var changelogExists = fs.existsSync(changelogPath);
        if (!changelogExists) {
            fs.writeFileSync(changelogPath, '');
        }
        var srcOptions = {
            buffer: false,
        };
        var conventionalChangelogOptions = {
            preset: 'angular',
        };
        return gulp.src(changelogPath, srcOptions)
            .pipe(conventionalChangelog(conventionalChangelogOptions))
            .pipe(gulp.dest('.'));
    });
    gulp.task('prepare-release-bump-version', function bumpVersion() {
        var argv = yargs.argv;
        var validBumpTypes = 'major|minor|patch|prerelease'.split('|');
        var bumpArgument = (argv.bump || 'patch').toLowerCase();
        if (validBumpTypes.indexOf(bumpArgument) === -1) {
            throw new Error("Unrecognized bump \"" + bumpArgument + "\".");
        }
        var bumpOptions = {
            type: bumpArgument,
        };
        return gulp.src(['./package.json', './bower.json'])
            .pipe(bump(bumpOptions))
            .pipe(gulp.dest(config.paths.root));
    });
    gulp.task('prepare-release', function (callback) {
        var tasks = [
            'doc',
            'prepare-release-bump-version',
            'prepare-release-generate-changelog',
        ];
        gulptraum.gulpAdapter.runTasksSequential(tasks, callback);
    });
}
exports.command = {
    generate: generate,
    name: 'prepare-release',
    help: 'Prepares the project for a release by generating the changelog and applying the specified version change',
};

//# sourceMappingURL=prepare_release.js.map
