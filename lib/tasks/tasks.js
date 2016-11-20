'use strict';

const groupBy = require('lodash.groupby');

function sortTaskNames(taskNames) {

  const taskNamesSorted = taskNames.sort((nameA, nameB) => {

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });

  return taskNamesSorted;
}

function generate(gulp, config, gulptraum) {

  gulp.task('tasks', () => {

    const taskNames = Object.keys(gulp.tasks);

    const groupedPluginKeys = groupBy(taskNames, (taskName) => {

      let topLevelTaskName = null;

      if (taskName.indexOf('-') > 0) {

        const taskNameSegments = taskName.split('-');

        topLevelTaskName = taskNameSegments[0];
      } else {

        topLevelTaskName = taskName;
      }

      return topLevelTaskName;
    });

    const groupKeys = Object.keys(groupedPluginKeys);

    groupKeys.forEach((groupKey) => {

      const groupTasks = groupedPluginKeys[groupKey];

      const groupTasksOrdered = sortTaskNames(groupTasks);

      console.log('--------------------------------------------------');

      for (let i = 0; i < groupTasksOrdered.length; i++) {

        console.log(`----- ${groupTasksOrdered[i]}`);

        if (i === 0 && groupTasksOrdered.length > 1) {
          console.log('----------------------------------------');
        }
      }

      console.log('--------------------------------------------------');
    });
    // console.log(taskNames);
  });

}

module.exports.generate = generate;
module.exports.name = 'tasks';
module.exports.help = 'Outputs an orderes list of all tasks registered to gulp.';
