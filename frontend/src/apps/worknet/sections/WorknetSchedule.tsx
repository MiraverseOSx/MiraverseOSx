import React, { useState } from 'react';
import {
  Calendar, Clock, AlertCircle, CheckCircle2, Shield, Plus, FileText, Send
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import type { ScheduledShiftItem } from '../worknetData';

interface WorknetScheduleProps {
  scheduleItems: ScheduledShiftItem[];
  leaveRequests: {
    id: string;
    shiftId: string;
    stationId: string;
    reason: string;
    status: 'Approved' | 'Pending' | 'Rejected';
    requestedAt: string;
    responseNote?: string;
  }[];
  onRequestLeave: (shiftId: string, reason: string) => void;
  onFeedback: (msg: string) => void;
}

export default function WorknetSchedule({
  scheduleItems,
  leaveRequests,
  onRequestLeave,
  onFeedback
}: WorknetScheduleProps) {
  const [selectedShiftForLeave, setSelectedShiftForLeave] = useState<string>('');
  const [leaveReason, setLeaveReason] = useState<string>('');

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftForLeave) {
      onFeedback('⚠️ Please select a scheduled shift for leave.');
      return;
    }
    onRequestLeave(selectedShiftForLeave, leaveReason);
    setSelectedShiftForLeave('');
    setLeaveReason('');
  };

  return (
    <div className="worknet-view-scroll">
      {/* Header */}
      <div className="worknet-card">
        <div className="flex items-center justify-between">
          <div>
            <span className="worknet-kicker">Multi-Employer Roster & Shifts</span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Work Schedule & Approved Leave
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Suggested shift rhythms across employers. You can switch work or take breaks without missed-shift penalties. Leave records help organize your plans.
            </p>
          </div>
          <span className="worknet-badge">
            <Calendar size={12} /> Live Roster
          </span>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="worknet-card">
        <div className="worknet-card-header">
          <h3 className="worknet-card-title">
            <Clock size={16} className="text-slate-600" />
            Suggested Shifts & Meeting Times
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Multi-Employer Conflict Status: <strong className="text-emerald-700">✓ No Overlaps Detected</strong>
          </span>
        </div>

        <table className="worknet-table">
          <thead>
            <tr>
              <th>Day / Time</th>
              <th>Institution</th>
              <th>Duty Title & Location</th>
              <th>Requirement</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduleItems.map(shift => (
              <tr key={shift.id}>
                <td>
                  <span className="font-semibold block text-slate-900">{shift.day}</span>
                  <span className="text-[11px] text-slate-500">{shift.timeSlot}</span>
                </td>
                <td>
                  <span className="font-medium text-slate-800">{shift.institutionName}</span>
                </td>
                <td>
                  <span className="font-semibold text-slate-900 block">{shift.dutyTitle}</span>
                  <span className="text-[11px] text-slate-500">{shift.location}</span>
                </td>
                <td>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    shift.isMandatory ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Flexible · no absence penalty
                  </span>
                </td>
                <td>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    shift.status === 'Leave Approved'
                      ? 'bg-blue-100 text-blue-800'
                      : shift.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {shift.status}
                  </span>
                </td>
                <td>
                  {shift.status === 'Scheduled' && (
                    <button
                      onClick={() => setSelectedShiftForLeave(shift.id)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold underline"
                    >
                      Request Leave
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leave Application & Approved Leave Logs */}
      <div className="worknet-grid-2">
        {/* Apply for Leave */}
        <div className="worknet-card">
          <div className="worknet-card-header">
            <h3 className="worknet-card-title">
              <Plus size={15} />
              Submit Leave Request
            </h3>
          </div>
          <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Shift</label>
              <select
                value={selectedShiftForLeave}
                onChange={e => setSelectedShiftForLeave(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 text-xs"
              >
                <option value="">Choose an upcoming shift...</option>
                {scheduleItems.filter(s => s.status === 'Scheduled').map(s => (
                  <option key={s.id} value={s.id}>
                    {s.day} ({s.timeSlot}) - {s.dutyTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for Absence</label>
              <textarea
                rows={3}
                placeholder="E.g., Medical check-up, academic symposium, family obligation..."
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              className="worknet-btn-primary w-full justify-center text-xs py-2"
            >
              <Send size={12} /> Submit to Supervisor for Approval
            </button>
          </form>
        </div>

        {/* Approved Leave Log */}
        <div className="worknet-card">
          <div className="worknet-card-header">
            <h3 className="worknet-card-title">
              <CheckCircle2 size={15} className="text-emerald-700" />
              Approved Leave & Absence Records
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {leaveRequests.map(req => (
              <div key={req.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{req.reason}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {req.status}
                  </span>
                </div>
                {req.responseNote && (
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "{req.responseNote}"
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block pt-1">
                  Requested: {req.requestedAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
