import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../Error/ErrorConstant";
import JWT from "jsonwebtoken";
import { customPayload, ReqUser } from "../../modules/Auth/auth.schema";
import logger from "../../libs/logger";
import { AppError } from "../Error/AppError";
import { rotateToken } from "../../modules/Auth/auth.service";
import { cookieOptions, COOKIE_NAMES } from "../cookieConfig";
import { prisma } from "../../libs/prisma";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info(`[AUTHENTICATE] Authenticating request for ${req.method} ${req.path}`);
    let refToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];
    let accToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    if (!refToken || !accToken) {
      logger.warn(`[AUTHENTICATE] Missing tokens - refToken: ${!!refToken}, accToken: ${!!accToken}`);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: true,
        data: null,
        message: "User does not have token(s), login again.",
      });
    }

    const accKey = process.env.ACCESS_KEY;
    const refKey = process.env.REFRESH_KEY;

    if (!accKey || !refKey) {
      logger.error(`[AUTHENTICATE] Missing environment variables - ACCESS_KEY: ${!!accKey}, REFRESH_KEY: ${!!refKey}`);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        data: null,
        message: "Missing env(s) data.",
      });
    }

    try {
      const accResult = JWT.verify(accToken, accKey) as customPayload;
      
      const tokenRecord = await prisma.token.findFirst({
        where: {
          id: accResult.refId || "",
          isRevoked: false,
        },
      });

      if (!tokenRecord) {
        logger.warn(`[AUTHENTICATE] Token has been revoked for user: ${accResult.email}`);
        throw new AppError("Token has been revoked. Please login again.", HTTP_STATUS.UNAUTHORIZED);
      }

      logger.info(`[AUTHENTICATE] Access token valid for user: ${accResult.email}`);
      const userData: ReqUser = {
        userId: accResult.userId,
        email: accResult.email,
        role: accResult.role,
      };
      req.user = userData;

      next();
      return;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        logger.info(`[AUTHENTICATE] Access token expired, attempting token rotation`);
        try {
          const refResult = JWT.verify(refToken, refKey) as customPayload;

          const tokenRecord = await prisma.token.findFirst({
            where: {
              id: refResult.refId || "",
              isRevoked: false,
            },
          });

          if (!tokenRecord) {
            logger.warn(`[AUTHENTICATE] Refresh token has been revoked for user: ${refResult.email}`);
            throw new AppError("Refresh token has been revoked. Please login again.", HTTP_STATUS.UNAUTHORIZED);
          }

          logger.info(`[AUTHENTICATE] Rotating tokens for user: ${refResult.email}`);
          const { refTokens, accTokens } = await rotateToken(refResult);

          res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookieOptions);
          res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookieOptions);

          res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refTokens, cookieOptions);
          res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accTokens, cookieOptions);

          const userData: ReqUser = {
            userId: refResult.userId,
            email: refResult.email,
            role: refResult.role,
          };
          req.user = userData;

          logger.info(`[AUTHENTICATE] Token rotation successful for user: ${refResult.email}`);
          next();
          return;
        } catch (refErr: any) {
          logger.error(`[AUTHENTICATE] Refresh token verification failed: ${refErr.message}`);
          throw new AppError("Invalid or expired refresh token. Please login again.", HTTP_STATUS.UNAUTHORIZED);
        }
      } else if (err.name === "JsonWebTokenError") {
        logger.error(`[AUTHENTICATE] Invalid JWT token: ${err.message}`);
        throw new AppError("Invalid token. Please login again.", HTTP_STATUS.UNAUTHORIZED);
      } else {
        throw err;
      }
    }
  } catch (err: any) {
    logger.error(`[AUTHENTICATE] Error occurred: ${err.message}`, { stack: err.stack });
    return res.status(err.statusCode || HTTP_STATUS.UNAUTHORIZED).json({
      error: true,
      data: null,
      message: err.message || "Unauthorized request, Login again!",
    });
  }
}
