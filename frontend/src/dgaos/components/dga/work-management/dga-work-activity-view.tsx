'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertOctagon,
  MessageSquare,
  Sparkles,
  Clock,
  User,
  Filter,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Task, DGACase, TaskActivityItem } from '@/lib/dga-types';

interface DgaWorkActivityViewProps {
  tasks: Task[];
  cases: DGACase[];
  onOpenTaskDetail: (task: Task) => void;
  onSelectCase?: (caseId: string) => void;
}

interface EnrichedActivityItem extends TaskActivityItem {
  taskId: string;
  taskTitle: string;
  caseId?: string;
}

export function DgaWorkActivityView({
  tasks,
  cases,
  onOpenTaskDetail,
  onSelectCase
}: DgaWorkActivityViewProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const caseMap = useMemo(() => {
    const map = new Map<string, DGACase>();
    cases.forEach((c) => map.set(c.id, c));
    return map;
  }, [cases]);

  // Aggregate all activity history items and comments across tasks
  const activities: EnrichedActivityItem[] = useMemo(() => {
    const list: EnrichedActivityItem[] = [];

    tasks.forEach((t) => {
      const c = t.caseId ? caseMap.get(t.caseId) : undefined;

      // From activityHistory
      if (t.activityHistory) {
        t.activityHistory.forEach((act) => {
          list.push({
            ...act,
            taskId: t.id,
            taskTitle: t.title,
            caseId: t.caseId || c?.id
          });
        });
      }

      // From comments
      if (t.comments) {
        t.comments.forEach((cm) => {
          list.push({
            id: cm.id,
            timestamp: cm.timestamp,
            action: 'COMMENT_ADDED',
            actor: cm.author,
            detail: `Logged note: "${cm.content.length > 60 ? cm.content.slice(0, 60) + '...' : cm.content}"`,
            taskId: t.id,
            taskTitle: t.title,
            caseId: t.caseId || c?.id
          });
        });
      }

      // If completed with completedAt and not yet in history
      if (t.completed && t.completedAt) {
        const exists = list.some((a) => a.taskId === t.id && a.action === 'COMPLETED');
        if (!exists) {
          list.push({
            id: `comp-${t.id}`,
            timestamp: t.completedAt,
            action: 'COMPLETED',
            actor: t.assignedTo || 'DGA OPERATIVE',
            detail: 'Directive execution verified and marked completed',
            taskId: t.id,
            taskTitle: t.title,
            caseId: t.caseId || c?.id
          });
        }
      }
    });

    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }, [tasks, caseMap]);

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    return activities.filter((act) => {
      if (filterType === 'comment') return act.action === 'COMMENT_ADDED';
      if (filterType === 'completed') return act.action === 'COMPLETED';
      if (filterType === 'status') return act.action.includes('STATUS') || act.action.includes('ASSIGNED');
      if (filterType === 'blocked') return act.action.includes('BLOCKED');
      return true;
    });
  }, [activities, filterType]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          label: 'RESOLVED'
        };
      case 'BLOCKED':
        return {
          icon: AlertOctagon,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          label: 'BLOCKED'
        };
      case 'COMMENT_ADDED':
        return {
          icon: MessageSquare,
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          label: 'DISPATCH'
        };
      case 'STATUS_CHANGE':
        return {
          icon: Activity,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          label: 'STATE SHIFT'
        };
      default:
        return {
          icon: Sparkles,
          color: 'text-[#544d7e] bg-[#f0eef6] border-[#2b2640]/10',
          label: action
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Activity Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#2b2640]/10 rounded-md">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#544d7e]" />
          <span className="text-[11px] font-mono tracking-wider font-semibold text-[#2b2640] uppercase">
            OPERATIONAL AUDIT TRAIL & SYSTEM DISPATCHES
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f3f2f8] text-[#544d7e] font-semibold border border-[#2b2640]/10">
            {filteredActivities.length} EVENTS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-[#2b2640]/40" />
          <span className="text-[10px] font-mono text-[#2b2640]/60 uppercase">Filter Stream:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-[10px] font-mono font-medium px-2 py-1 bg-[#f8f7fc] border border-[#2b2640]/15 rounded text-[#2b2640] focus:outline-none focus:border-[#544d7e]"
          >
            <option value="all">ALL AUDIT EVENTS</option>
            <option value="completed">COMPLETIONS</option>
            <option value="comment">DISPATCH NOTES</option>
            <option value="status">STATUS TRANSITIONS</option>
            <option value="blocked">BLOCKERS & DEPENDENCIES</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white border border-[#2b2640]/15 rounded-md shadow-sm divide-y divide-[#2b2640]/10 overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-[#2b2640]/40 font-mono text-xs">
            NO RECORDED AUDIT EVENTS MATCHING FILTER
          </div>
        ) : (
          filteredActivities.map((act) => {
            const badge = getActionBadge(act.action);
            const Icon = badge.icon;
            const task = tasks.find((t) => t.id === act.taskId);

            return (
              <div
                key={act.id}
                className="p-3.5 hover:bg-[#faf9fd] transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Action Icon Badge */}
                  <div
                    className={`mt-0.5 p-1.5 rounded border flex-shrink-0 ${badge.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider bg-white">
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#2b2640]">
                        {act.actor}
                      </span>
                      <span className="text-[10px] font-mono text-[#2b2640]/40">•</span>
                      <span className="text-[10px] font-mono text-[#2b2640]/50">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      {act.caseId && (
                        <button
                          type="button"
                          onClick={() => act.caseId && onSelectCase && onSelectCase(act.caseId)}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#f0eef6] text-[#4b4372] border border-[#2b2640]/10 hover:bg-[#e4e0f0] transition-colors"
                        >
                          {act.caseId}
                        </button>
                      )}
                    </div>

                    <p className="text-xs font-sans text-[#2b2640]/80">{act.detail}</p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#2b2640]/50">
                      <span>Target Directive:</span>
                      <span className="font-semibold text-[#544d7e]">{act.taskId}</span>
                      <span>—</span>
                      <span className="truncate max-w-[320px]">{act.taskTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Right button: Jump to directive */}
                {task && (
                  <button
                    type="button"
                    onClick={() => onOpenTaskDetail(task)}
                    className="flex-shrink-0 text-[10px] font-mono font-semibold px-2 py-1 rounded bg-[#f4f2f8] text-[#544d7e] border border-[#2b2640]/10 hover:bg-[#544d7e] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>OPEN</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
