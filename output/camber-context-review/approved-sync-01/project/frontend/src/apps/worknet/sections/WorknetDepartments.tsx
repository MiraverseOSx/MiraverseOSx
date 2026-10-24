import React from 'react';
import {
  Building, Users, Shield, ExternalLink, ArrowRight, Layers
} from 'lucide-react';
import { useOSStore } from '../../../store/useOSStore';
import { INSTITUTIONAL_REGISTRY } from '../worknetData';
import type { WorkplaceStationId } from '../../JobWorkstationApp';

interface WorknetDepartmentsProps {
  activeStation: WorkplaceStationId;
  onFeedback: (msg: string) => void;
}

export default function WorknetDepartments({ activeStation, onFeedback }: WorknetDepartmentsProps) {
  const theme = INSTITUTIONAL_REGISTRY[activeStation] || INSTITUTIONAL_REGISTRY.dga;

  const handleLaunchApp = (appId: string, title: string) => {
    useOSStore.getState().openWindow(appId as any);
    onFeedback(`🚀 Launched ${title} from institutional department directory.`);
  };

  return (
    <div className="worknet-view-scroll">
      {/* Header */}
      <div className="worknet-card">
        <span className="worknet-kicker">Organizational Structure & Hierarchy</span>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          {theme.fullName} Directory
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Authorized division rosters, leadership chain of command, and connected institutional operational software.
        </p>
      </div>

      {/* Divisions Hierarchy */}
      <div className="worknet-card space-y-4">
        <div className="worknet-card-header">
          <h3 className="worknet-card-title">
            <Layers size={16} className="text-slate-700" />
            Institutional Divisions & Bureaus
          </h3>
          <span className="worknet-badge">Clearance Tier {theme.clearanceRequired}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {theme.divisions.map(div => (
            <div key={div.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 block">{div.name}</span>
              <p className="text-[11px] text-slate-500 font-medium">Head: {div.head}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">{div.description}</p>
              <span className="text-[10px] text-slate-400 block pt-1">
                {div.staffCount} Active Personnel Assigned
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Applications (§17) */}
      <div className="worknet-card space-y-4">
        <div className="worknet-card-header">
          <h3 className="worknet-card-title">
            <Building size={16} className="text-slate-700" />
            Connected Specialized Applications (§17)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Direct Launch</span>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Specialized professional tools remain situated within their respective applications. Work orders span across these tools with unified career tracking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {theme.externalApps.map(app => (
            <div key={app.id} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col justify-between text-xs space-y-2">
              <div>
                <h4 className="font-bold text-slate-900">{app.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{app.description}</p>
              </div>
              <button
                onClick={() => handleLaunchApp(app.appId, app.title)}
                className="worknet-btn-secondary text-[11px] justify-center w-full"
              >
                Launch {app.title} <ExternalLink size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
