import { Router } from "express";
import {
  createNotificationHandler,
  getNotificationsHandler,
  getNotificationByIdHandler,
  updateNotificationHandler,
  approveNotificationHandler,
  rejectNotificationHandler,
  deleteNotificationHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from "./notification.controller";
import { authenticate } from "../../config/middleware/authenticate";

export const notificationRouter = Router();

// All notification routes require authentication
notificationRouter.use(authenticate);

// Create notification
notificationRouter.post("/", createNotificationHandler);

// Get all notifications for current user (with optional filters)
notificationRouter.get("/", getNotificationsHandler);

// Mark all notifications as read
notificationRouter.put("/read-all", markAllAsReadHandler);

// Get notification by ID
notificationRouter.get("/:id", getNotificationByIdHandler);

// Update notification
notificationRouter.put("/:id", updateNotificationHandler);

// Approve notification (admin only)
notificationRouter.put("/:id/approve", approveNotificationHandler);

// Reject notification (admin only)
notificationRouter.put("/:id/reject", rejectNotificationHandler);

// Mark notification as read
notificationRouter.put("/:id/read", markAsReadHandler);

// Delete notification
notificationRouter.delete("/:id", deleteNotificationHandler);
