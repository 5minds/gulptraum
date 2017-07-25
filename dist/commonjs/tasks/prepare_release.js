"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const fs = require("fs");
const path = require("path");
const bump = require("gulp-bump");
const conventionalChangelog = require("gulp-conventional-changelog");
function generate(gulp, config, gulptraum) {
    gulp.task('prepare-release-generate-changelog', function prepareRelease() {
        const changelogPath = path.resolve(config.paths.changelog);
        const changelogExists = fs.existsSync(changelogPath);
        if (!changelogExists) {
            fs.writeFileSync(changelogPath, '');
        }
        const srcOptions = {
            buffer: false,
        };
        const conventionalChangelogOptions = {
            preset: 'angular',
        };
        return gulp.src(changelogPath, srcOptions)
            .pipe(conventionalChangelog(conventionalChangelogOptions))
            .pipe(gulp.dest('.'));
    });
    gulp.task('prepare-release-bump-version', function bumpVersion() {
        const argv = yargs.argv;
        const validBumpTypes = 'major|minor|patch|prerelease'.split('|');
        const bumpArgument = (argv.bump || 'patch').toLowerCase();
        if (validBumpTypes.indexOf(bumpArgument) === -1) {
            throw new Error(`Unrecognized bump "${bumpArgument}".`);
        }
        const bumpOptions = {
            type: bumpArgument,
        };
        return gulp.src(['./package.json', './bower.json'])
            .pipe(bump(bumpOptions))
            .pipe(gulp.dest(config.paths.root));
    });
    gulp.task('prepare-release', (callback) => {
        const tasks = [
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
