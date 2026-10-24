import { DGACase, Objective, Task, CaseStatus } from './dga-types';

export function calculateCaseProgress(dgaCase: DGACase): {
  taskPercent: number;
  completedTasks: number;
  totalTasks: number;
  objectivePercent: number;
  completedObjectives: number;
  totalObjectives: number;
} {
  const totalTasks = dgaCase.tasks.length;
  const completedTasks = dgaCase.tasks.filter((t) => t.completed).length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalObjectives = dgaCase.objectives.length;
  const completedObjectives = dgaCase.objectives.filter((o) => o.completed).length;
  const objectivePercent = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

  return {
    taskPercent,
    completedTasks,
    totalTasks,
    objectivePercent,
    completedObjectives,
    totalObjectives
  };
}

export function canCloseCase(dgaCase: DGACase): { allowed: boolean; reason?: string } {
  const { completedObjectives, totalObjectives } = calculateCaseProgress(dgaCase);

  if (totalObjectives > 0 && completedObjectives < totalObjectives) {
    return {
      allowed: false,
      reason: `Cannot close case: ${totalObjectives - completedObjectives} primary objectives remain unfulfilled.`
    };
  }

  const uncompletedCriticalTasks = dgaCase.tasks.filter((t) => !t.completed && t.phase === 'Intervention');
  if (uncompletedCriticalTasks.length > 0) {
    return {
      allowed: false,
      reason: `Cannot close case: Intervention phase tasks are still pending.`
    };
  }

  return { allowed: true };
}
