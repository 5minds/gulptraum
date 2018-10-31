import {IGroupedPluginKeys} from '../interfaces';

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

    const groupedPluginKeys: IGroupedPluginKeys = {};

    for (const taskName of taskNames) {

      let topLevelTaskName = null;

      if (taskName.indexOf('-') > 0) {

        const taskNameSegments = taskName.split('-');

        topLevelTaskName = taskNameSegments[0];
      } else {

        topLevelTaskName = taskName;
      }

      const groupHasMatchingKey: boolean = groupedPluginKeys[topLevelTaskName] !== undefined;
      if (groupHasMatchingKey) {
        groupedPluginKeys[topLevelTaskName].push(taskName);
      } else {
        groupedPluginKeys[topLevelTaskName] = [taskName];
      }
    }

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
  });

}

export const command = {
  generate: generate,
  name: 'tasks',
  help: 'Outputs an orderes list of all tasks registered to gulp.',
};
