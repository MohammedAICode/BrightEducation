import { Request, Response } from "express";
import { AppError } from "../../config/Error/AppError";
import logger from "../../libs/logger";
import {
  HTTP_STATUS,
  USER_ERROR_MESSAGES,
} from "../../config/Error/ErrorConstant";
import { loginSchema } from "./auth.schema";
import { 
  loginUser, 
  forgotPassword, 
  resetPasswordRequest, 
  approvePasswordReset
} from "./auth.service";
import { userExists } from "../User/user.service";
import { getProfileImgUrl } from "../../config/Multer/multer";
import { cookieOptions, COOKIE_NAMES } from "../../config/cookieConfig";
import { prisma } from "../../libs/prisma";

async function login(req: Request, res: Response) {
  logger.info(`[LOGIN] Login request received for email: ${req.body.email}`);
  try {
    let { email, password } = req.body;

    const parseResult = loginSchema.safeParse({
      email,
      password,
    });

    if (!parseResult.success) {
      logger.warn(
        `[LOGIN] Validation failed for email: ${email}`,
        { errors: parseResult.error.issues }
      );
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        body: null,
        message: parseResult.error,
      });
    }

    const { refToken, accToken } = await loginUser(email, password);

    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refToken, cookieOptions);
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accToken, cookieOptions);

    logger.info(`[LOGIN] Login successful for user: ${email}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      body: {
        email,
      },
      message: "Login successful",
    });
  } catch (err: any) {
    logger.error(`[LOGIN] Error occurred: ${err.message}`, { stack: err.stack });
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function me(req: Request, res: Response) {
  try {
    const currUser = req.user;

    if (!currUser) {
      logger.error(`[ME] Unable to access the current user from request`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        body: null,
        message:
          "Unable to access the current user details. Please login again.",
      });
    }

    logger.info(`[ME] Fetching user details for: ${currUser.email}`);

    const result = await userExists(currUser.email, null, false);

    if (!result) {
      logger.error(`[ME] User not found: ${currUser.email}`);
      throw new AppError(
        USER_ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.BAD_REQUEST,
      );
    }


    // fetching only the user details, but we need to fetch the respective details as well.
    const { id, ...userData } = result;

    // Transform profileImgKey to profileImg URL
    const userDataWithImg = {
      ...userData,
      profileImg: userData.profileImgKey ? getProfileImgUrl(userData.profileImgKey) : null,
    };

    logger.info(`[ME] User details retrieved successfully for: ${currUser.email}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      body: userDataWithImg,
      message: "User found successfully",
    });
  } catch (err: any) {
    logger.error(`[ME] Error occurred: ${err.message}`, { stack: err.stack });
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function logout(req: Request, res: Response) {
  try {
    const currUser = req.user;

    if (currUser) {
      logger.info(`[LOGOUT] Revoking all tokens for user: ${currUser.email}`);
      await prisma.token.updateMany({
        where: { userId: currUser.userId },
        data: { isRevoked: true },
      });
    }

    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookieOptions);
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookieOptions);

    logger.info(`[LOGOUT] User logged out successfully: ${currUser?.email || 'unknown'}`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      body: null,
      message: "User logout successfully",
    });
  } catch (err: any) {
    logger.error(`[LOGOUT] Error occurred: ${err.message}`, { stack: err.stack });
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function forgotPasswordHandler(req: Request, res: Response) {
  logger.info(`[FORGOT_PASSWORD] Forgot password request received`);
  try {
    const { email } = req.body;

    if (!email) {
      logger.warn(`[FORGOT_PASSWORD] Email is required`);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        body: null,
        message: "Email is required",
      });
    }

    const result = await forgotPassword(email);

    logger.info(`[FORGOT_PASSWORD] Forgot password request processed successfully`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      body: null,
      message: result.message,
    });
  } catch (err: any) {
    logger.error(`[FORGOT_PASSWORD] Error occurred: ${err.message}`, { stack: err.stack });
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function resetPasswordRequestHandler(req: Request, res: Response) {
  logger.info(`[RESET_PASSWORD_REQUEST] Password change request received`);
  try {
    const currUser = req.user;

    if (!currUser) {
      logger.error(`[RESET_PASSWORD_REQUEST] User not authenticated`);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: true,
        body: null,
        message: "User not authenticated",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      logger.warn(`[RESET_PASSWORD_REQUEST] Current password and new password are required`);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        body: null,
        message: "Current password and new password are required",
      });
    }

    const result = await resetPasswordRequest(currUser.userId, currentPassword, newPassword);

    logger.info(`[RESET_PASSWORD_REQUEST] Password change request processed successfully`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      body: null,
      message: result.message,
    });
  } catch (err: any) {
    logger.error(`[RESET_PASSWORD_REQUEST] Error occurred: ${err.message}`, { stack: err.stack });
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

async function approvePasswordResetHandler(req: Request, res: Response) {
  logger.info(`[APPROVE_PASSWORD_RESET] Password reset approval request received`);
  try {
    const currUser = req.user;

    if (!currUser) {
      logger.error(`[APPROVE_PASSWORD_RESET] User not authenticated`);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: true,
        body: null,
        message: "User not authenticated",
      });
    }

    if (currUser.role !== "ADMIN") {
      logger.error(`[APPROVE_PASSWORD_RESET] User is not admin: ${currUser.email}`);
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: true,
        body: null,
        message: "Only administrators can approve password resets",
      });
    }

    const { notificationId, action } = req.body;

    if (!notificationId || !action) {
      logger.warn(`[APPROVE_PASSWORD_RESET] Notification ID and action are required`);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        body: null,
        message: "Notification ID and action are required",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      logger.warn(`[APPROVE_PASSWORD_RESET] Invalid action: ${action}`);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        body: null,
        message: "Action must be 'approve' or 'reject'",
      });
    }

    const result = await approvePasswordReset(notificationId, action, currUser.userId);

    logger.info(`[APPROVE_PASSWORD_RESET] Password reset ${action} processed successfully`);
    return res.status(HTTP_STATUS.OK).json({
      error: false,
      body: null,
      message: result.message,
    });
  } catch (err: any) {
    logger.error(`[APPROVE_PASSWORD_RESET] Error occurred: ${err.message}`, { stack: err.stack });
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export { 
  login, 
  me, 
  logout, 
  forgotPasswordHandler, 
  resetPasswordRequestHandler, 
  approvePasswordResetHandler
};
