import { Request, Response } from "express";
import { AppError } from "../../config/Error/AppError";
import { HTTP_STATUS } from "../../config/Error/ErrorConstant";
import logger from "../../libs/logger";
import {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  NotificationStatus,
} from "./notification.service";

async function createNotificationHandler(req: Request, res: Response) {
  try {
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const { type, status, relatedUserId, data, title, message, priority } = req.body;

    const notification = await createNotification({
      type,
      status,
      userId: currUser.userId,
      relatedUserId,
      data,
      title,
      message,
      priority,
    });

    logger.info(`[NOTIFICATION_CONTROLLER] Notification created: ${notification.id}`);
    return res.status(HTTP_STATUS.CREATED).json({
      error: false,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error creating notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function getNotificationsHandler(req: Request, res: Response) {
  try {
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const { status, unreadOnly } = req.query;

    const notifications = await getNotifications(
      currUser.userId,
      status as string,
      unreadOnly === "true"
    );

    logger.info(`[NOTIFICATION_CONTROLLER] Retrieved ${notifications.length} notifications`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: notifications,
      message: "Notifications retrieved successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error fetching notifications: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function getNotificationByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const notificationId = Array.isArray(id) ? id[0] : id;
    const notification = await getNotificationById(notificationId);

    // Check if user has permission to view this notification
    if (notification.userId !== currUser.userId && currUser.role !== "ADMIN") {
      throw new AppError("You do not have permission to view this notification", HTTP_STATUS.FORBIDDEN);
    }

    logger.info(`[NOTIFICATION_CONTROLLER] Retrieved notification: ${notificationId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: notification,
      message: "Notification retrieved successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error fetching notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function updateNotificationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const { status, data, isRead } = req.body;

    const notificationId = Array.isArray(id) ? id[0] : id;
    const existingNotification = await getNotificationById(notificationId);

    // Check if user has permission to update this notification
    if (existingNotification.userId !== currUser.userId && currUser.role !== "ADMIN") {
      throw new AppError("You do not have permission to update this notification", HTTP_STATUS.FORBIDDEN);
    }

    const notification = await updateNotification(
      notificationId,
      { status, data, isRead },
      currUser.userId
    );

    logger.info(`[NOTIFICATION_CONTROLLER] Notification updated: ${notificationId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: notification,
      message: "Notification updated successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error updating notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function approveNotificationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    if (currUser.role !== "ADMIN") {
      throw new AppError("Only admins can approve notifications", HTTP_STATUS.FORBIDDEN);
    }

    const notificationId = Array.isArray(id) ? id[0] : id;
    const notification = await updateNotification(
      notificationId,
      { status: NotificationStatus.APPROVED },
      currUser.userId
    );

    logger.info(`[NOTIFICATION_CONTROLLER] Notification approved: ${notificationId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: notification,
      message: "Notification approved successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error approving notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function rejectNotificationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    if (currUser.role !== "ADMIN") {
      throw new AppError("Only admins can reject notifications", HTTP_STATUS.FORBIDDEN);
    }

    const { reason } = req.body;

    const notificationId = Array.isArray(id) ? id[0] : id;
    const existingNotification = await getNotificationById(notificationId);

    const notification = await updateNotification(
      notificationId,
      { 
        status: NotificationStatus.REJECTED,
        data: { ...(typeof existingNotification.data === 'object' ? existingNotification.data : {}), reason },
      },
      currUser.userId
    );

    logger.info(`[NOTIFICATION_CONTROLLER] Notification rejected: ${notificationId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: notification,
      message: "Notification rejected successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error rejecting notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function deleteNotificationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const notificationId = Array.isArray(id) ? id[0] : id;
    const existingNotification = await getNotificationById(notificationId);

    // Check if user has permission to delete this notification
    if (existingNotification.userId !== currUser.userId && currUser.role !== "ADMIN") {
      throw new AppError("You do not have permission to delete this notification", HTTP_STATUS.FORBIDDEN);
    }

    const result = await deleteNotification(notificationId);

    logger.info(`[NOTIFICATION_CONTROLLER] Notification deleted: ${notificationId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: result,
      message: "Notification deleted successfully",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error deleting notification: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function markAsReadHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const notificationId = Array.isArray(id) ? id[0] : id;
    const notification = await markAsRead(notificationId);

    logger.info(`[NOTIFICATION_CONTROLLER] Notification marked as read: ${notificationId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error marking notification as read: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function markAllAsReadHandler(req: Request, res: Response) {
  try {
    const currUser = req.user;
    
    if (!currUser) {
      throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await markAllAsRead(currUser.userId);

    logger.info(`[NOTIFICATION_CONTROLLER] All notifications marked as read for user: ${currUser.userId}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: result,
      message: "All notifications marked as read",
    });
  } catch (err: any) {
    logger.error(`[NOTIFICATION_CONTROLLER] Error marking all notifications as read: ${err.message}`);
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export {
  createNotificationHandler,
  getNotificationsHandler,
  getNotificationByIdHandler,
  updateNotificationHandler,
  approveNotificationHandler,
  rejectNotificationHandler,
  deleteNotificationHandler,
  markAsReadHandler,
  markAllAsReadHandler,
};
