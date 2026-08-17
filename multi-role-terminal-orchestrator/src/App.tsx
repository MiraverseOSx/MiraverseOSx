/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { Desktop } from './components/layout/Desktop';
import { Taskbar } from './components/layout/Taskbar';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { useSystemStore } from './store/useSystemStore';

export default function App() {
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const { notifications } = useSystemStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-commissioner">
      {/* Top OS Navigation & Shift Status */}
      <TopBar
        onToggleNotifications={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
        notificationsCount={notifications.length}
      />

      {/* Main Desktop Operating System Workspace */}
      <Desktop />

      {/* Bottom Taskbar / App Launcher Dock */}
      <Taskbar />

      {/* Slide-out Notification Telemetry Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}

