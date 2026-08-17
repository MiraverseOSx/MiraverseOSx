import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore';

const TONE_STYLES = {
    success: { icon: CheckCircle2, className: 'border-emerald-300 bg-emerald-50 text-emerald-950' },
    warning: { icon: AlertTriangle, className: 'border-amber-300 bg-amber-50 text-amber-950' },
    danger: { icon: AlertTriangle, className: 'border-rose-300 bg-rose-50 text-rose-950' },
    info: { icon: Info, className: 'border-indigo-300 bg-indigo-50 text-indigo-950' },
};

export default function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);
    const dismissToast = useToastStore((state) => state.dismissToast);

    return (
        <div className="pointer-events-none fixed bottom-16 right-4 z-[100] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2" aria-live="polite" aria-atomic="false">
            <AnimatePresence initial={false}>
                {toasts.map((toast) => {
                    const tone = TONE_STYLES[toast.tone] || TONE_STYLES.info;
                    const Icon = tone.icon;
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 24, scale: 0.97 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 18, scale: 0.97 }}
                            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg ${tone.className}`}
                            role="status"
                        >
                            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold">{toast.title}</div>
                                {toast.message && <div className="mt-0.5 text-[11px] leading-relaxed opacity-80">{toast.message}</div>}
                            </div>
                            <button onClick={() => dismissToast(toast.id)} className="rounded p-1 opacity-60 hover:bg-black/5 hover:opacity-100" aria-label="Dismiss notification">
                                <X size={14} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
