import React from 'react';
import { CheckCircle2, Award, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
import { ActionResolutionResult } from '../../types/orchestrator';

interface ActionFeedbackModalProps {
  result: ActionResolutionResult | null;
  onClose: () => void;
}

export const ActionFeedbackModal: React.FC<ActionFeedbackModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-commissioner animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                ORCHESTRATOR EVALUATION
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {result.outcome_title || 'Directive Executed'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 text-slate-800">
          {/* Score & Reputation Card */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold font-mono text-slate-900">
                {result.score}/100
              </div>
              <div className="text-xs text-slate-500">
                <span>Tactical Precision</span>
                <strong className="block text-slate-800 uppercase font-mono font-bold text-[11px]">
                  {result.status || 'Optimal Execution'}
                </strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">REPUTATION GAIN</span>
              <span className="text-base font-mono font-black text-emerald-600">
                {result.department_rep_gain || '+20 Rep'}
              </span>
            </div>
          </div>

          {/* Outcome Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
              Consequences & Field Telemetry
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {result.outcome_details}
            </p>
          </div>

          {/* Follow-up narrative */}
          {result.follow_up_narrative && (
            <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-[11px] uppercase tracking-wide">
                  Scenario Progression
                </strong>
                <span>{result.follow_up_narrative}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>Return to Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
