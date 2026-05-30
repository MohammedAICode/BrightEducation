import { Token } from "../../../generated/prisma/client";
import { IS_ACTIVE, ROLE_TYPE } from "../../../generated/prisma/enums";
import { compareProtect, generateToken, protect } from "../../config/config";
import { AppError } from "../../config/Error/AppError";
import {
  COMMON_ERROR_MESSAGES,
  HTTP_STATUS,
  USER_ERROR_MESSAGES,
} from "../../config/Error/ErrorConstant";
import logger from "../../libs/logger";
import { prisma } from "../../libs/prisma";
import { userExists } from "../User/user.service";
import { customPayload } from "./auth.schema";
import { userEventEmitter, UserEvents } from "../../config/Events/eventListener";
import { createNotification, NotificationType, NotificationStatus } from "../Notification/notification.service";

async function loginUser(
  email: string,
  password: string,
): Promise<{
  refToken: string;
  accToken: string;
}> {
  logger.info(`[LOGIN_SERVICE] Attempting to login user: ${email}`);
  const userFound = await userExists(email, null, true);

  if (!userFound) {
    logger.error(`[LOGIN_SERVICE] User not found: ${email}`);
    throw new AppError(
      USER_ERROR_MESSAGES.USER_NOT_FOUND,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (userFound.isActive !== IS_ACTIVE.ACTIVE) {
    logger.error(`[LOGIN_SERVICE] User does not present in active state: ${userFound.isActive}`);
    throw new AppError(
      USER_ERROR_MESSAGES.USER_NOT_ACITVE,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!userFound.password) {
    logger.error(`[LOGIN_SERVICE] User password not set for: ${email}`);
    if (userFound.isActive != IS_ACTIVE.ACTIVE) {
      logger.info(
        `[LOGIN_SERVICE] User ${email} found in ${userFound.isActive} status, password not setup`,
      );
    }
    throw new AppError(
      USER_ERROR_MESSAGES.USER_INCOMPLETE,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!(await compareProtect(password, userFound.password))) {
    logger.error(`[LOGIN_SERVICE] Password mismatch for user: ${email}`);
    throw new AppError(
      USER_ERROR_MESSAGES.USER_PASSWORD_INCORRECT,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  logger.info(`[LOGIN_SERVICE] Password verified for user: ${email}`);

  const payload = {
    userId: userFound.id,
    email: userFound.email,
    role: userFound.role,
  };

  logger.info(`[LOGIN_SERVICE] Generating tokens for user: ${email}`);
  const refToken = await generateToken(payload, false, null);

  if (!refToken) {
    logger.error(`[LOGIN_SERVICE] Failed to create refresh token for user: ${email}`);
    throw new AppError(
      COMMON_ERROR_MESSAGES.FEILD_MISSING,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  logger.info(`[LOGIN_SERVICE] Storing refresh token for user: ${email}`);
  const refResult = await storeToken(await protect(refToken), userFound.id);

  const accToken = await generateToken(payload, true, refResult.id);

  if (!accToken) {
    logger.error(`[LOGIN_SERVICE] Failed to create access token for user: ${email}`);
    throw new AppError(
      COMMON_ERROR_MESSAGES.FEILD_MISSING,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  logger.info(`[LOGIN_SERVICE] Tokens generated successfully for user: ${email}`);
  
  // Emit login event to update lastLogin timestamp
  userEventEmitter.emit(UserEvents.USER_LOGIN, {
    userId: userFound.id,
    email: userFound.email,
  });
  
  return {
    refToken,
    accToken,
  };
}

async function storeToken(token: string, id: string): Promise<Token> {
  logger.info(`[STORE_TOKEN] Storing token for user ID: ${id}`);
  return await prisma.token.create({
    data: {
      token: token,
      userId: id,
    },
  });
}

async function rotateToken(data: customPayload) {
  logger.info(`[ROTATE_TOKEN] Starting token rotation for user: ${data.email}`);
  logger.info(`[ROTATE_TOKEN] Revoking all existing tokens for user: ${data.email}`);
  await prisma.token.updateMany({
    where: {
      userId: data.userId,
    },
    data: {
      isRevoked: true,
    },
  });

  const userFound = await userExists(data.email, null, true);

  if (!userFound || userFound.isActive != IS_ACTIVE.ACTIVE) {
    logger.error(
      `[ROTATE_TOKEN] User not found or inactive for: ${data.email}, status: ${userFound ? userFound.isActive : 'N/A'}`,
    );
    throw new AppError(
      USER_ERROR_MESSAGES.USER_NOT_FOUND,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const payload = {
    userId: data.userId,
    email: data.email,
    role: data.role,
  };

  logger.info(`[ROTATE_TOKEN] Generating new tokens for user: ${data.email}`);
  const refTokens = await generateToken(payload, false, data.userId);

  if (!refTokens) {
    logger.error(`[ROTATE_TOKEN] Failed to create refresh token for user: ${data.email}`);
    throw new AppError(
      COMMON_ERROR_MESSAGES.FEILD_MISSING,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  const refResult = await storeToken(await protect(refTokens), userFound.id);

  const accTokens = await generateToken(payload, true, refResult.id);

  if (!accTokens) {
    logger.error(`[ROTATE_TOKEN] Failed to create access token for user: ${data.email}`);
    throw new AppError(
      COMMON_ERROR_MESSAGES.FEILD_MISSING,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  logger.info(`[ROTATE_TOKEN] Token rotation completed successfully for user: ${data.email}`);
  return {
    refTokens,
    accTokens,
  };
}

async function forgotPassword(email: string) {
  logger.info(`[FORGOT_PASSWORD] Processing forgot password request for: ${email}`);
  
  const user = await userExists(email, null, true);
  
  if (!user) {
    logger.error(`[FORGOT_PASSWORD] User not found: ${email}`);
    throw new AppError(USER_ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  // Find all admin users
  const admins = await prisma.user.findMany({
    where: { role: ROLE_TYPE.ADMIN, isActive: IS_ACTIVE.ACTIVE },
  });

  if (admins.length === 0) {
    logger.error(`[FORGOT_PASSWORD] No active admins found`);
    throw new AppError("No active administrators available", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Create notification for each admin
  for (const admin of admins) {
    await createNotification({
      type: NotificationType.PASSWORD_CHANGE,
      status: NotificationStatus.PENDING,
      userId: admin.id,
      relatedUserId: user.id,
      data: {
        requestType: "FORGOT_PASSWORD",
        userEmail: user.email,
        userName: `${user.firstname} ${user.lastname || ''}`,
      },
      title: "Password Reset Request",
      message: `${user.firstname} ${user.lastname || ''} (${user.email}) has requested a password reset.`,
      priority: "HIGH",
    });
  }

  logger.info(`[FORGOT_PASSWORD] Notification sent to ${admins.length} admins for: ${email}`);
  return { message: "Password reset request sent to administrators" };
}

async function resetPasswordRequest(userId: string, currentPassword: string, newPassword: string) {
  logger.info(`[RESET_PASSWORD_REQUEST] Processing password change request for user: ${userId}`);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    logger.error(`[RESET_PASSWORD_REQUEST] User not found: ${userId}`);
    throw new AppError(USER_ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!user.password) {
    logger.error(`[RESET_PASSWORD_REQUEST] User has no password set: ${userId}`);
    throw new AppError(USER_ERROR_MESSAGES.USER_INCOMPLETE, HTTP_STATUS.BAD_REQUEST);
  }

  if (!(await compareProtect(currentPassword, user.password))) {
    logger.error(`[RESET_PASSWORD_REQUEST] Current password incorrect for user: ${userId}`);
    throw new AppError(USER_ERROR_MESSAGES.USER_PASSWORD_INCORRECT, HTTP_STATUS.BAD_REQUEST);
  }

  // If user is an admin, update password directly without approval
  if (user.role === ROLE_TYPE.ADMIN) {
    const hashedPassword = await protect(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    logger.info(`[RESET_PASSWORD_REQUEST] Admin password updated directly for user: ${userId}`);
    return { message: "Password updated successfully" };
  }

  // For non-admin users, hash the new password and send notification to admins for approval
  const hashedNewPassword = await protect(newPassword);
  const admins = await prisma.user.findMany({
    where: { role: ROLE_TYPE.ADMIN, isActive: IS_ACTIVE.ACTIVE },
  });

  if (admins.length === 0) {
    logger.error(`[RESET_PASSWORD_REQUEST] No active admins found`);
    throw new AppError("No active administrators available", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Create notification for each admin with the hashed new password
  for (const admin of admins) {
    await createNotification({
      type: NotificationType.PASSWORD_CHANGE,
      status: NotificationStatus.PENDING,
      userId: admin.id,
      relatedUserId: user.id,
      data: {
        requestType: "RESET_PASSWORD",
        userEmail: user.email,
        userName: `${user.firstname} ${user.lastname || ''}`,
        hashedNewPassword,
      },
      title: "Password Change Request",
      message: `${user.firstname} ${user.lastname || ''} (${user.email}) has requested to change their password.`,
      priority: "HIGH",
    });
  }

  // Also create a notification for the user who requested the change
  await createNotification({
    type: NotificationType.PASSWORD_CHANGE,
    status: NotificationStatus.PENDING,
    userId: user.id,
    relatedUserId: user.id,
    data: {
      requestType: "RESET_PASSWORD_REQUEST_SENT",
      userEmail: user.email,
      userName: `${user.firstname} ${user.lastname || ''}`,
    },
    title: "Password Change Request Sent",
    message: "Your password change request has been sent to administrators for approval.",
    priority: "NORMAL",
  });

  logger.info(`[RESET_PASSWORD_REQUEST] Notification sent to ${admins.length} admins and user: ${userId}`);
  return { message: "Password change request sent to administrators" };
}

async function approvePasswordReset(notificationId: string, action: "approve" | "reject", adminId: string) {
  logger.info(`[APPROVE_PASSWORD_RESET] Processing ${action} for notification: ${notificationId}`);
  
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      relatedUser: true,
    },
  });

  if (!notification) {
    logger.error(`[APPROVE_PASSWORD_RESET] Notification not found: ${notificationId}`);
    throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
  }

  if (notification.type !== NotificationType.PASSWORD_CHANGE) {
    logger.error(`[APPROVE_PASSWORD_RESET] Invalid notification type: ${notification.type}`);
    throw new AppError("Invalid notification type", HTTP_STATUS.BAD_REQUEST);
  }

  const requestType = (notification.data as any)?.requestType;
  const user = notification.relatedUser;

  if (!user) {
    logger.error(`[APPROVE_PASSWORD_RESET] Related user not found for notification: ${notificationId}`);
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  if (action === "reject") {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.REJECTED,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    logger.info(`[APPROVE_PASSWORD_RESET] Password reset rejected for user: ${user.email}`);
    return { message: "Password reset request rejected" };
  }

  // Approve
  if (requestType === "FORGOT_PASSWORD") {
    // Set password to firstname@dateofbirth-year
    const year = new Date(user.dateOfBirth).getFullYear();
    const newPassword = `${user.firstname}@${year}`;
    const hashedPassword = await protect(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.APPROVED,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    logger.info(`[APPROVE_PASSWORD_RESET] Password reset to default for user: ${user.email}`);
    return { message: "Password reset to default format" };
  } else if (requestType === "RESET_PASSWORD") {
    // Directly update password with the hashed password from notification data
    const hashedNewPassword = (notification.data as any)?.hashedNewPassword;
    
    if (!hashedNewPassword) {
      logger.error(`[APPROVE_PASSWORD_RESET] No hashed password found in notification data`);
      throw new AppError("Invalid notification data", HTTP_STATUS.BAD_REQUEST);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.APPROVED,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    // Notify user that password has been updated
    await createNotification({
      type: NotificationType.PASSWORD_CHANGE,
      status: NotificationStatus.COMPLETED,
      userId: user.id,
      relatedUserId: adminId,
      data: {
        requestType: "PASSWORD_UPDATED",
      },
      title: "Password Updated",
      message: "Your password has been successfully updated by the administrator.",
      priority: "NORMAL",
    });

    logger.info(`[APPROVE_PASSWORD_RESET] Password updated for user: ${user.email}`);
    return { message: "Password updated successfully" };
  }

  throw new AppError("Invalid request type", HTTP_STATUS.BAD_REQUEST);
}

export { 
  loginUser, 
  rotateToken, 
  forgotPassword, 
  resetPasswordRequest, 
  approvePasswordReset
};
