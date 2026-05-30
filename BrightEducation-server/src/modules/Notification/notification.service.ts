import { prisma } from "../../libs/prisma";
import { AppError } from "../../config/Error/AppError";
import { HTTP_STATUS } from "../../config/Error/ErrorConstant";
import logger from "../../libs/logger";

// Notification types
export enum NotificationType {
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  LOGIN_ALERT = "LOGIN_ALERT",
  SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
}

// Notification status
export enum NotificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

// Notification priority
export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

interface CreateNotificationInput {
  type: string;
  status: string;
  userId: string;
  relatedUserId?: string;
  data?: any;
  title: string;
  message: string;
  priority?: string;
}

interface UpdateNotificationInput {
  status?: string;
  data?: any;
  isRead?: boolean;
  processedBy?: string;
}

async function createNotification(input: CreateNotificationInput) {
  logger.info(`[NOTIFICATION_SERVICE] Creating notification for user: ${input.userId}`);
  
  try {
    const notification = await prisma.notification.create({
      data: {
        type: input.type,
        status: input.status,
        userId: input.userId,
        relatedUserId: input.relatedUserId,
        data: input.data,
        title: input.title,
        message: input.message,
        priority: input.priority || NotificationPriority.NORMAL,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    logger.info(`[NOTIFICATION_SERVICE] Notification created successfully: ${notification.id}`);
    return notification;
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error creating notification: ${err.message}`);
    throw new AppError(err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function getNotifications(userId: string, status?: string, unreadOnly?: boolean) {
  logger.info(`[NOTIFICATION_SERVICE] Fetching notifications for user: ${userId}`);
  
  try {
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        processor: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    logger.info(`[NOTIFICATION_SERVICE] Retrieved ${notifications.length} notifications`);
    return notifications;
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error fetching notifications: ${err.message}`);
    throw new AppError(err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function getNotificationById(id: string) {
  logger.info(`[NOTIFICATION_SERVICE] Fetching notification: ${id}`);
  
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        processor: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    if (!notification) {
      throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
    }

    return notification;
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error fetching notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function updateNotification(id: string, input: UpdateNotificationInput, processorId?: string) {
  logger.info(`[NOTIFICATION_SERVICE] Updating notification: ${id}`);
  
  try {
    const updateData: any = { ...input };
    
    if (processorId) {
      updateData.processedBy = processorId;
      updateData.processedAt = new Date();
    }

    if (input.isRead === true && !updateData.readAt) {
      updateData.readAt = new Date();
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        processor: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    logger.info(`[NOTIFICATION_SERVICE] Notification updated successfully: ${notification.id}`);
    return notification;
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error updating notification: ${err.message}`);
    throw new AppError(err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function deleteNotification(id: string) {
  logger.info(`[NOTIFICATION_SERVICE] Deleting notification: ${id}`);
  
  try {
    await prisma.notification.delete({
      where: { id },
    });

    logger.info(`[NOTIFICATION_SERVICE] Notification deleted successfully: ${id}`);
    return { message: "Notification deleted successfully" };
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error deleting notification: ${err.message}`);
    throw new AppError(err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function markAsRead(id: string) {
  logger.info(`[NOTIFICATION_SERVICE] Marking notification as read: ${id}`);
  
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info(`[NOTIFICATION_SERVICE] Notification marked as read: ${id}`);
    return notification;
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error marking notification as read: ${err.message}`);
    throw new AppError(err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function markAllAsRead(userId: string) {
  logger.info(`[NOTIFICATION_SERVICE] Marking all notifications as read for user: ${userId}`);
  
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info(`[NOTIFICATION_SERVICE] All notifications marked as read for user: ${userId}`);
    return { message: "All notifications marked as read" };
  } catch (err: any) {
    logger.error(`[NOTIFICATION_SERVICE] Error marking all notifications as read: ${err.message}`);
    throw new AppError(err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
};
