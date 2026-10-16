'use client';
import { MapPin, Package, Microscope, HeartPulse, UserCheck, Scale, ChevronRight, Gavel } from 'lucide-react';

interface InvestigationBreadcrumbsProps {
  currentView: string;
  navigate: (view: string) => void;
  caseId?: string;
}

interface InvestigationStage {
  id: string;
  label: string;
  viewName: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge: string;
  status: 'complete' | 'active' | 'ready';
}

export default function InvestigationBreadcrumbs({
  currentView,
  navigate,
  caseId = 'CASE-2026-0042',
}: InvestigationBreadcrumbsProps) {
  const STAGES: InvestigationStage[] = [
    {
      id: 'scene',
      label: 'Crime Scene',
      viewName: 'Crime Scene (CSI)',
      icon: MapPin,
      badge: '4 Markers',
      status: 'complete',
    },
    {
      id: 'evidence',
      label: 'Evidence Chain',
      viewName: 'Evidence',
      icon: Package,
      badge: 'Seals Intact',
      status: 'complete',
    },
    {
      id: 'lab',
      label: 'Physical Lab',
      viewName: 'Laboratory',
      icon: Microscope,
      badge: 'Fibers & Glass',
      status: 'complete',
    },
    {
      id: 'morgue',
      label: 'Forensic Morgue',
      viewName: 'Forensic Morgue',
      icon: HeartPulse,
      badge: 'Autopsy Signed',
      status: 'complete',
    },
    {
      id: 'interrogation',
      label: 'Interrogation',
      viewName: 'Interrogation Room',
      icon: UserCheck,
      badge: 'Alibi Broken',
      status: 'complete',
    },
    {
      id: 'warrants',
      label: 'Warrants & DA',
      viewName: 'Legal & Warrants',
      icon: Scale,
      badge: 'Grand Jury Ready',
      status: 'complete',
    },
    {
      id: 'trial',
      label: 'Courtroom Trial',
      viewName: 'Courtroom Trial',
      icon: Gavel,
      badge: 'Cross-Exam Active',
      status: currentView === 'Courtroom Trial' ? 'active' : 'ready',
    },
  ];

  return (
    <div className="investigation-breadcrumbs-container mb-6 p-3 bg-white border border-[#a89bc2] rounded-xl shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4338ca]" />
          <span className="text-xs uppercase font-bold tracking-wider text-[#4338ca]">
            Investigation Pipeline
          </span>
          <span className="text-[#a89bc2]">/</span>
          <span className="text-xs font-bold text-[#0f0d1a]">{caseId}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#2c273d]">
          <span className="font-medium">Case Sufficiency:</span>
          <span className="font-bold text-[#047857]">83% Solved</span>
        </div>
      </div>

      <nav aria-label="Investigation stages pipeline" className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = currentView === stage.viewName;
          return (
            <div key={stage.id} className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate(stage.viewName)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#c1b4d9] border-[#a89bc2] text-[#0f0d1a] font-bold shadow-sm'
                    : 'bg-[#f8f6fc] hover:bg-[#ece7f4] border-[#e5e0f0] text-[#2c273d]'
                }`}
                title={`Navigate to ${stage.label}`}
              >
                <Icon
                  size={14}
                  className={isCurrent ? 'text-[#4338ca]' : 'text-[#64748b]'}
                />
                <span className="whitespace-nowrap">{stage.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-tight ${
                    isCurrent
                      ? 'bg-white text-[#0f0d1a] border border-[#a89bc2]'
                      : 'bg-white text-[#4b465c] border border-[#e5e0f0]'
                  }`}
                >
                  {stage.badge}
                </span>
              </button>

              {idx < STAGES.length - 1 && (
                <ChevronRight size={13} className="text-[#a89bc2] mx-1 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
