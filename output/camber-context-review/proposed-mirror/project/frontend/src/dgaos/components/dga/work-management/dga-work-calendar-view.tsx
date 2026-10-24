'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2
} from 'lucide-react';
import { Task, DGACase } from '@/lib/dga-types';

interface DgaWorkCalendarViewProps {
  tasks: Task[];
  cases: DGACase[];
  onOpenTaskDetail: (task: Task) => void;
}

export function DgaWorkCalendarView({
  tasks,
  cases,
  onOpenTaskDetail
}: DgaWorkCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const jumpToday = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Map tasks to dates
  const taskMap: Record<number, Task[]> = {};
  for (const t of tasks) {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!taskMap[dayNum]) taskMap[dayNum] = [];
        taskMap[dayNum].push(t);
      }
    }
  }

  // Days grid calculation
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="bg-white border border-[#cfcddb] rounded-lg shadow-2xs overflow-hidden flex flex-col">
      {/* Calendar Header */}
      <div className="p-3 bg-[#f5f4f9] border-b border-[#dedce8] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#5d5a86]" />
          <span className="font-bold text-sm text-[#242335] font-mono tracking-tight">
            {monthNames[month].toUpperCase()} {year}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={jumpToday}
            className="px-2.5 py-1 bg-white border border-[#cfcddb] hover:border-[#5d5a86] rounded text-[11px] font-semibold text-[#302e47] transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1 bg-white border border-[#cfcddb] hover:border-[#5d5a86] rounded text-[#504e6c] hover:text-[#201f30] cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 bg-white border border-[#cfcddb] hover:border-[#5d5a86] rounded text-[#504e6c] hover:text-[#201f30] cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#e2e0eb] bg-[#faf9fc] text-center text-[10px] font-bold uppercase tracking-wider text-[#696787] py-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#ecebf3] min-h-[500px]">
        {calendarCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="bg-[#fcfbfd] p-1.5" />;
          }

          const dayTasks = taskMap[dayNum] || [];
          const isToday = isCurrentMonthToday && today.getDate() === dayNum;

          return (
            <div
              key={`day-${dayNum}`}
              className={`p-1.5 min-h-[90px] flex flex-col transition-colors ${
                isToday ? 'bg-[#f4f3fb]' : 'hover:bg-[#faf9fc]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span
                  className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                    isToday ? 'bg-[#5d5a86] text-white' : 'text-[#44425e]'
                  }`}
                >
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[9px] font-mono font-bold text-[#7a7898]">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Day Tasks List */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-24 scrollbar-none">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onOpenTaskDetail(task)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-colors border ${
                      task.completed
                        ? 'bg-[#f0eff5] border-[#dcdbe6] text-[#7f7d98] line-through'
                        : task.priority === 'Critical'
                        ? 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-400'
                        : task.priority === 'High'
                        ? 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400'
                        : 'bg-white border-[#cfcddb] text-[#2c2a41] hover:border-[#5d5a86]'
                    }`}
                    title={task.title}
                  >
                    <span className="font-mono font-bold mr-1">{task.id}</span>
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
