"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortTaskNames(taskNames) {
    var taskNamesSorted = taskNames.sort(function (nameA, nameB) {
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
    gulp.task('tasks', function () {
        var taskNames = Object.keys(gulp.tasks);
        var groupedPluginKeys = {};
        for (var _i = 0, taskNames_1 = taskNames; _i < taskNames_1.length; _i++) {
            var taskName = taskNames_1[_i];
            var topLevelTaskName = null;
            if (taskName.indexOf('-') > 0) {
                var taskNameSegments = taskName.split('-');
                topLevelTaskName = taskNameSegments[0];
            }
            else {
                topLevelTaskName = taskName;
            }
            var groupHasMatchingKey = groupedPluginKeys[topLevelTaskName] !== undefined;
            if (groupHasMatchingKey) {
                groupedPluginKeys[topLevelTaskName].push(taskName);
            }
            else {
                groupedPluginKeys[topLevelTaskName] = [taskName];
            }
        }
        var groupKeys = Object.keys(groupedPluginKeys);
        groupKeys.forEach(function (groupKey) {
            var groupTasks = groupedPluginKeys[groupKey];
            var groupTasksOrdered = sortTaskNames(groupTasks);
            console.log('--------------------------------------------------');
            for (var i = 0; i < groupTasksOrdered.length; i++) {
                console.log("----- " + groupTasksOrdered[i]);
                if (i === 0 && groupTasksOrdered.length > 1) {
                    console.log('----------------------------------------');
                }
            }
            console.log('--------------------------------------------------');
        });
    });
}
exports.command = {
    generate: generate,
    name: 'tasks',
    help: 'Outputs an orderes list of all tasks registered to gulp.',
};

//# sourceMappingURL=tasks.js.map
