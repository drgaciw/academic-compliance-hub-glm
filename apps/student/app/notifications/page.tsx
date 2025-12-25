"use client";

import { NotificationPreferencesPage } from "../components/notification-preferences";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <NotificationPreferencesPage />
      </div>
    </main>
  );
}
