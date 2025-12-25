import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { logger } from "../middleware";
import { prisma } from "@aah/database";

const createNotificationInput = z.object({
  type: z.enum(["info", "success", "warning", "error"]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
});

const listNotificationsInput = z.object({
  unreadOnly: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
});

const markAsReadInput = z.object({
  notificationId: z.string().cuid(),
});

const markAllAsReadInput = z.object({});

export const createNotification = protectedProcedure
  .input(createNotificationInput)
  .output(
    z.object({
      id: z.string().cuid(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      read: z.boolean(),
      createdAt: z.date(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Creating notification", {
      type: input.type,
      user: ctx.user.id,
    });

    try {
      const notification = await prisma.notification.create({
        data: {
          userId: ctx.user.id,
          type: (input.type.toUpperCase() + "_TYPE") as any,
          title: input.title,
          message: input.message,
          read: false,
        },
      });

      return {
        id: notification.id,
        type: notification.type.replace("_TYPE", ""),
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      };
    } catch (error) {
      logger.error("Failed to create notification", error);
      throw error;
    }
  });

export const listNotifications = protectedProcedure
  .input(listNotificationsInput)
  .output(
    z.object({
      notifications: z.array(
        z.object({
          id: z.string().cuid(),
          type: z.string(),
          title: z.string(),
          message: z.string(),
          read: z.boolean(),
          createdAt: z.date(),
        }),
      ),
      unreadCount: z.number(),
      total: z.number(),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Listing notifications", {
      user: ctx.user.id,
      unreadOnly: input.unreadOnly,
    });

    try {
      const where: any = { userId: ctx.user.id };

      if (input.unreadOnly) {
        where.read = false;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { userId: ctx.user.id, read: false },
        }),
      ]);

      return {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt,
        })),
        unreadCount,
        total,
      };
    } catch (error) {
      logger.error("Failed to list notifications", error);
      throw error;
    }
  });

export const markAsRead = protectedProcedure
  .input(markAsReadInput)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Marking notification as read", {
      notificationId: input.notificationId,
      user: ctx.user.id,
    });

    try {
      const notification = await prisma.notification.findUnique({
        where: { id: input.notificationId },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      if (notification.userId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      await prisma.notification.update({
        where: { id: input.notificationId },
        data: { read: true, readAt: new Date() },
      });

      return {
        success: true,
        message: "Notification marked as read",
      };
    } catch (error) {
      logger.error("Failed to mark notification as read", error);
      throw error;
    }
  });

export const markAllAsRead = protectedProcedure
  .input(markAllAsReadInput)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      count: z.number(),
    }),
  )
  .mutation(async ({ ctx }) => {
    logger.info("Marking all notifications as read", {
      user: ctx.user.id,
    });

    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: ctx.user.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return {
        success: true,
        message: "All notifications marked as read",
        count: result.count,
      };
    } catch (error) {
      logger.error("Failed to mark all notifications as read", error);
      throw error;
    }
  });

export const deleteNotification = protectedProcedure
  .input(markAsReadInput)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Deleting notification", {
      notificationId: input.notificationId,
      user: ctx.user.id,
    });

    try {
      const notification = await prisma.notification.findUnique({
        where: { id: input.notificationId },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      if (notification.userId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      await prisma.notification.delete({
        where: { id: input.notificationId },
      });

      return {
        success: true,
        message: "Notification deleted",
      };
    } catch (error) {
      logger.error("Failed to delete notification", error);
      throw error;
    }
  });

export const notificationsRouter = router({
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
});
