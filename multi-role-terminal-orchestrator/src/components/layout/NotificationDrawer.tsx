import React from 'react';
import {
  Bell,
  X,
  Trash2,
  AlertCircle,
  Stethoscope,
  Search,
  Radio,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    dismissNotification,
    clearNotifications,
    openModule,
    setSelectedEvent,
  } = useSystemStore();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: any) => {
    if (notif.module !== 'system') {
      openModule(notif.module);
      if (notif.eventId) {
        setSelectedEvent(notif.eventId);
      }
    }
    dismissNotification(notif.id);
  };

  return (
    <aside className="fixed top-11 bottom-12 right-0 w-80 sm:w-96 bg-white shadow-2xl border-l border-slate-300 z-50 flex flex-col font-commissioner animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-300" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Supervisor Telemetry Feed ({notifications.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear All"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No active notification alerts. System channels nominal.
          </div>
        ) : (
          notifications.map((n) => {
            const isCritical = n.urgency === 'critical';
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 bg-white rounded-lg border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
                  isCritical
                    ? 'border-red-400 bg-red-50/30 hover:border-red-500'
                    : n.module === 'medical'
                    ? 'border-emerald-300 hover:border-emerald-500'
                    : n.module === 'investigation'
                    ? 'border-blue-300 hover:border-blue-500'
                    : 'border-purple-300 hover:border-purple-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {n.module === 'medical' && <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />}
                    {n.module === 'investigation' && <Search className="w-3.5 h-3.5 text-blue-700" />}
                    {n.module === 'dispatch' && <Radio className="w-3.5 h-3.5 text-purple-600" />}
                    {n.module === 'system' && <AlertCircle className="w-3.5 h-3.5 text-slate-600" />}

                    <span className="font-semibold text-xs text-slate-900 leading-tight">
                      {n.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {n.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {n.urgency}
                  </span>

                  <span className="text-slate-400 flex items-center gap-1 hover:text-slate-700">
                    Open Window <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
