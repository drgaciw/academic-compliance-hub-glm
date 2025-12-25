"use client";

import { useState } from "react";
import { trpc } from "@aah/trpc/client";
import { NotificationBell } from "../notification-bell";
import type { Notification } from "../notification-bell";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const listNotifications = trpc.notifications.listNotifications.useQuery(
    {},
    {
      refetchInterval: 30000,
      onSuccess: (data) => {
        setNotifications(
          data.notifications.map((n) => ({
            id: n.id,
            type: n.type.toLowerCase() as Notification["type"],
            title: n.title,
            message: n.message,
            read: n.read,
            createdAt: n.createdAt,
          })),
        );
        setUnreadCount(data.unreadCount);
      },
    },
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      listNotifications.refetch();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      listNotifications.refetch();
    },
  });

  const deleteNotificationMutation =
    trpc.notifications.deleteNotification.useMutation({
      onSuccess: () => {
        listNotifications.refetch();
      },
    });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ notificationId: id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({});
  };

  const handleDismiss = (id: string) => {
    deleteNotificationMutation.mutate({ notificationId: id });
  };

  return {
    notifications,
    unreadCount,
    isLoading: listNotifications.isLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDismiss,
  };
}
