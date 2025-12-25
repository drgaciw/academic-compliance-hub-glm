"use client";

import { NotificationBell } from "../notification-bell";
import { useNotifications } from "../hooks/use-notifications";

export function HeaderWithNotifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDismiss,
  } = useNotifications();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-xl font-bold">Student Portal</h1>
      </div>
      <div className="flex items-center gap-4">
        {!isLoading && (
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    </header>
  );
}
