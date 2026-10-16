import { Task, DGACase } from '@/lib/dga-types';

export interface EvaluatedTask extends Task {
  isBlocked: boolean;
  blockers: {
    taskId: string;
    taskTitle: string;
    completed: boolean;
  }[];
  uncompletedSubtasksCount: number;
  totalSubtasksCount: number;
}

/**
 * Re-evaluates all task states within a case or global task list.
 * Determines if tasks are blocked by unfinished prerequisite dependencies.
 */
export function evaluateTaskDependencies(tasks: Task[]): EvaluatedTask[] {
  const taskMap = new Map<string, Task>();
  for (const t of tasks) {
    taskMap.set(t.id, t);
  }

  return tasks.map((task) => {
    const blockers: EvaluatedTask['blockers'] = [];
    let isDependencyBlocked = false;

    if (task.dependsOn && task.dependsOn.length > 0) {
      for (const depId of task.dependsOn) {
        const depTask = taskMap.get(depId);
        if (depTask) {
          if (!depTask.completed) {
            isDependencyBlocked = true;
            blockers.push({
              taskId: depTask.id,
              taskTitle: depTask.title,
              completed: false
            });
          }
        }
      }
    }

    const totalSubtasksCount = task.subtasks ? task.subtasks.length : 0;
    const uncompletedSubtasksCount = task.subtasks
      ? task.subtasks.filter((st) => !st.completed).length
      : 0;

    const isExplicitlyBlocked = task.status === 'blocked';
    const isBlocked = isExplicitlyBlocked || isDependencyBlocked;

    return {
      ...task,
      isBlocked,
      blockers,
      totalSubtasksCount,
      uncompletedSubtasksCount
    };
  });
}

/**
 * Checks if completing a given task unblocks any dependent tasks.
 */
export function findUnblockedDependents(completedTaskId: string, allTasks: Task[]): Task[] {
  const taskMap = new Map<string, Task>();
  for (const t of allTasks) {
    taskMap.set(t.id, t);
  }

  const unblocked: Task[] = [];
  for (const task of allTasks) {
    if (task.dependsOn && task.dependsOn.includes(completedTaskId)) {
      // Check if all OTHER dependencies of this task are also completed
      const otherUnfinished = task.dependsOn
        .filter((id) => id !== completedTaskId)
        .some((id) => {
          const t = taskMap.get(id);
          return t && !t.completed;
        });

      if (!otherUnfinished && task.status === 'blocked') {
        unblocked.push(task);
      }
    }
  }

  return unblocked;
}
