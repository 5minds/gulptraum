'use strict';

const fs = require('fs');
const path = require('path');
const runSequence = require('run-sequence');
const yargs = require('yargs');
const bump = require('gulp-bump');
const conventionalChangelog = require('gulp-conventional-changelog');

function generate(gulp, config) {

  gulp.task('prepare-release-generate-changelog', function prepareRelease() {
    return gulp.src(config.paths.doc + '/CHANGELOG.md', {
        buffer: false
      }).pipe(conventionalChangelog({
        preset: 'angular'
      }))
      .pipe(gulp.dest(config.paths.doc));
  });

  gulp.task('prepare-release-bump-version', function bumpVersion() {

    const argv = yargs.argv;
    const validBumpTypes = 'major|minor|patch|prerelease'.split('|');
    const bumpArgument = (argv.bump || 'patch').toLowerCase();

    if (validBumpTypes.indexOf(bumpArgument) === -1) {
      throw new Error(`Unrecognized bump "${bumpArgument}".`);
    }

    return gulp.src(['./package.json', './bower.json'])
      .pipe(bump({
        type: bumpArgument,
      })) // major|minor|patch|prerelease
      .pipe(gulp.dest(config.paths.root));
  });

  gulp.task('prepare-release', (callback) => {

    const runSequenceWithGulp = runSequence.use(gulp);
    runSequenceWithGulp(
      'doc',
      'prepare-release-generate-changelog',
      'prepare-release-bump-version',
      callback
    );
  });
}

module.exports.generate = generate;
