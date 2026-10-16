import {
  AutomationTrigger,
  DGAState,
  Task
} from '@/lib/dga-types';
import { findUnblockedDependents } from './dependency-engine';

export interface AutomationExecutionResult {
  ruleId: string;
  ruleName: string;
  executed: boolean;
  actionTaken: string;
  payloadMutations?: Record<string, unknown>;
}

/**
 * Evaluates and executes matching enabled automation rules against the DGA state.
 * Returns state mutations and execution logs.
 */
export function processAutomations(
  state: DGAState,
  trigger: AutomationTrigger,
  context: {
    caseId?: string;
    taskId?: string;
    task?: Task;
    forensicRequestId?: string;
    forensicSummary?: string;
  }
): {
  mutatedState: DGAState;
  results: AutomationExecutionResult[];
} {
  const matchingRules = state.automationRules.filter((r) => r.enabled && r.trigger === trigger);
  if (matchingRules.length === 0) {
    return { mutatedState: state, results: [] };
  }

  const results: AutomationExecutionResult[] = [];
  const nextState: DGAState = { ...state };
  const now = new Date().toISOString();

  for (const rule of matchingRules) {
    if (rule.trigger === 'ON_TASK_COMPLETED' && rule.action === 'UNBLOCK_DEPENDENTS' && context.taskId && context.caseId) {
      const targetCase = nextState.cases.find((c) => c.id === context.caseId);
      if (targetCase) {
        const unblocked = findUnblockedDependents(context.taskId, targetCase.tasks);
        for (const unb of unblocked) {
          unb.status = 'in_progress';
          unb.activityHistory = unb.activityHistory || [];
          unb.activityHistory.push({
            id: `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: now,
            actor: 'DGA Automation Daemon',
            action: 'AUTOMATION_UNBLOCKED',
            detail: `Prerequisite ${context.taskId} completed. Unblocked directive.`
          });
        }
        if (unblocked.length > 0) {
          rule.executionCount = (rule.executionCount || 0) + 1;
          rule.lastExecutedAt = now;
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            executed: true,
            actionTaken: `Unblocked ${unblocked.length} dependent task(s).`
          });
        }
      }
    } else if (rule.trigger === 'ON_TASK_BLOCKED' && rule.action === 'CREATE_ALERT' && context.task) {
      const alertId = `ALT-${Date.now()}`;
      nextState.alerts.unshift({
        id: alertId,
        level: rule.actionPayload.level || 'FLASH',
        title: rule.actionPayload.title || 'OPERATIONAL TASK BLOCKED',
        message: `Task "${context.task.title}" has been flagged as BLOCKED in Case ${context.caseId || 'DGA'}. Immediate supervisor review required.`,
        source: 'WORK_MGMT_DAEMON',
        timestamp: now,
        actionRequired: true,
        caseId: context.caseId
      });
      rule.executionCount = (rule.executionCount || 0) + 1;
      rule.lastExecutedAt = now;
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        executed: true,
        actionTaken: `Emitted FLASH alert for blocked task "${context.task.title}".`
      });
    } else if (rule.trigger === 'ON_ALL_PHASE_TASKS_COMPLETE' && rule.action === 'UPDATE_CASE_STATUS' && context.caseId) {
      const targetCase = nextState.cases.find((c) => c.id === context.caseId);
      if (targetCase) {
        const phaseTasks = targetCase.tasks.filter((t) => t.phase === 'Preliminary');
        const allDone = phaseTasks.length > 0 && phaseTasks.every((t) => t.completed);
        if (allDone && targetCase.status !== rule.actionPayload.targetStatus) {
          targetCase.status = rule.actionPayload.targetStatus || 'Active';
          targetCase.timeline.unshift({
            id: `TL-${Date.now()}`,
            timestamp: now,
            type: 'STATUS_CHANGED',
            actor: 'DGA Automation Daemon',
            description: `Auto-advanced case status to ${targetCase.status} following completion of Preliminary tasks.`
          });
          rule.executionCount = (rule.executionCount || 0) + 1;
          rule.lastExecutedAt = now;
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            executed: true,
            actionTaken: `Advanced Case ${targetCase.id} status to ${targetCase.status}.`
          });
        }
      }
    } else if (rule.trigger === 'ON_FORENSIC_RESULT_RECEIVED' && rule.action === 'CREATE_FOLLOWUP_TASK' && context.caseId) {
      const targetCase = nextState.cases.find((c) => c.id === context.caseId);
      if (targetCase) {
        const newTaskId = `TSK-${Date.now().toString().slice(-4)}`;
        targetCase.tasks.unshift({
          id: newTaskId,
          caseId: targetCase.id,
          title: rule.actionPayload.title || 'Review Forensic Findings',
          description: context.forensicSummary || 'Forensic laboratory examination transmitted to case.',
          phase: rule.actionPayload.phase || 'Forensic Analysis',
          priority: rule.actionPayload.priority || 'High',
          completed: false,
          status: 'pending',
          assignedTo: targetCase.assignedAgents[0] || 'Special Agent Miracle Jerome',
          tags: ['#TRACE_RESULT', '#FORENSICS']
        });
        rule.executionCount = (rule.executionCount || 0) + 1;
        rule.lastExecutedAt = now;
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          executed: true,
          actionTaken: `Created followup task ${newTaskId} for forensic review.`
        });
      }
    }
  }

  return { mutatedState: nextState, results };
}
