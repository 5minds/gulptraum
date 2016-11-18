'use strict';

function generate(gulp, config, cli) {

  gulp.task('tasks', () => {

    const taskNames = Object.keys(gulp.tasks);

    const taskNamesSorted = taskNames.sort((nameA, nameB) => {

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

    console.log(taskNames);
  });

}

module.exports.generate = generate;
module.exports.name = 'tasks';
module.exports.help = 'Outputs an orderes list of all tasks registered to gulp.';
