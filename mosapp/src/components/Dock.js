import React from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '../store/useOSStore';
import { APPS } from '../apps/registry';

export default function Dock() {
  const addWindow = useOSStore((s) => s.addWindow);
  const windows = useOSStore((s) => s.windows);
  const openIds = new Set(windows.map((w) => w.id));

  return (
    <div className="fixed inset-x-0 bottom-2 z-[9998] flex justify-center">
      <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
        {APPS.map((app) => {
          const Icon = app.icon;
          return (
            <motion.button
              key={app.id}
              onClick={() => addWindow(app)}
              whileHover={{ scale: 1.35, y: -8 }}
              whileTap={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative flex flex-col items-center"
              title={app.title}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/25 to-white/5 text-white shadow-lg">
                <Icon size={26} />
              </span>
              {openIds.has(app.id) && (
                <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-white" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
