import React from 'react';
import {
  BarChart2,
  CheckCircle2,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Stethoscope,
  Radio,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

export const StatsWindow: React.FC = () => {
  const { stats, resolvedHistory, activeEvents } = useSystemStore();

  const getRatingGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300' };
    if (score >= 88) return { grade: 'A', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    if (score >= 80) return { grade: 'B+', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
    if (score >= 70) return { grade: 'B', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    return { grade: 'C', color: 'text-red-700', bg: 'bg-red-50 border-red-200' };
  };

  const overall = getRatingGrade(stats.overallRating);

  return (
    <div className="flex flex-col gap-4 font-commissioner text-slate-800">
      {/* Shift Overview Banner */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-heading font-black text-2xl ${overall.bg} ${overall.color} shadow-xs`}>
            {overall.grade}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                OPERATOR EFFICIENCY RATING
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {stats.overallRating}% Efficiency
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Metropolitan Shift Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Resolved: <strong>{resolvedHistory.length} Directives</strong> • Pending in Queue: <strong>{activeEvents.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">SHIFT TIME</span>
            <strong className="text-slate-800 text-sm">08:56:06 AM</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">SECTOR SECURITY</span>
            <strong className="text-emerald-700 text-sm font-bold">SECURE</strong>
          </div>
        </div>
      </div>

      {/* 3 Department Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Medical Stats */}
        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-300 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
              Medical Department
            </span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              {stats.medicalScore}%
            </span>
          </div>
          <div className="w-full bg-emerald-200/60 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.medicalScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-emerald-800">
            <span>Patients Treated:</span>
            <strong>{stats.patientsTreated}</strong>
          </div>
        </div>

        {/* Investigation Stats */}
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-900" />
              Forensics Bureau
            </span>
            <span className="font-mono font-bold text-blue-950 text-sm">
              {stats.investigationScore}%
            </span>
          </div>
          <div className="w-full bg-slate-300 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.investigationScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-800">
            <span>Cases Cleared:</span>
            <strong>{stats.casesResolved}</strong>
          </div>
        </div>

        {/* Dispatch Stats */}
        <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-300 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-700" />
              911 Dispatch Control
            </span>
            <span className="font-mono font-bold text-purple-900 text-sm">
              {stats.dispatchScore}%
            </span>
          </div>
          <div className="w-full bg-purple-200/60 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.dispatchScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-purple-800">
            <span>Units Deployed:</span>
            <strong>{stats.unitsDispatched}</strong>
          </div>
        </div>
      </div>

      {/* Resolution Log History */}
      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2 flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-slate-600" />
          Shift Directives & AI Supervisor Evaluations Log
        </h4>

        {resolvedHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-commissioner italic">
            No directives resolved yet this shift. Execute clinical, detective, or dispatch orders to log performance.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {resolvedHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                        item.module === 'medical'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.module === 'investigation'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-purple-100 text-purple-900 border-purple-300'
                      }`}
                    >
                      {item.module}
                    </span>
                    <strong className="text-slate-900">{item.result.outcome_title}</strong>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-700 font-bold">{item.result.department_rep_gain}</span>
                    <span className="text-slate-400 text-[10px]">{item.timestamp}</span>
                  </div>
                </div>

                <div className="text-slate-700 text-[11px] font-mono bg-white p-1.5 rounded border border-slate-200">
                  <span className="text-slate-400">Order: </span>
                  "{item.actionTaken}"
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  {item.result.outcome_details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
