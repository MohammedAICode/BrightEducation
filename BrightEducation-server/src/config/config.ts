import bcrypt from "bcrypt";
import "dotenv/config";
import logger from "../libs/logger";
import { AppError } from "./Error/AppError";
import { COMMON_ERROR_MESSAGES, HTTP_STATUS } from "./Error/ErrorConstant";
import { IS_ACTIVE, ROLE_TYPE } from "../../generated/prisma/enums";
import JWT, { SignOptions } from "jsonwebtoken";
import { accPayload, refPayload } from "../modules/Auth/auth.schema";

export async function protect(text: string): Promise<string> {
  const salt = process.env.SALT;
  if (!salt) {
    logger.error(
      `[PROTECT] Missing environment variable: SALT`,
    );
    throw new AppError(
      COMMON_ERROR_MESSAGES.ENV_MISSING,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  logger.info(`[PROTECT] Hashing text with bcrypt`);
  return bcrypt.hash(text, Number(salt));
}

export async function compareProtect(
  text: string,
  pText: string,
): Promise<boolean> {
  logger.info(`[COMPARE_PROTECT] Comparing password hash`);
  return bcrypt.compare(text, pText);
}

export async function generateToken(
  details: {
    userId: string;
    email: string;
    role: ROLE_TYPE;
  },
  isAccess: boolean,
  id: string | null,
): Promise<string> {
  const tokenType = isAccess ? "access" : "refresh";
  logger.info(`[GENERATE_TOKEN] Generating ${tokenType} token for user: ${details.email}`);
  
  let key, validity;
  if (isAccess) {
    key = process.env.ACCESS_KEY;
    validity = process.env.ACCESS_VALIDITY;
  } else {
    key = process.env.REFRESH_KEY;
    validity = process.env.REFRESH_VALIDITY;
  }
  if (!key || !validity) {
    logger.error(`[GENERATE_TOKEN] Missing environment variables for ${tokenType} token - KEY: ${!!key}, VALIDITY: ${!!validity}`);
    throw new AppError(
      COMMON_ERROR_MESSAGES.ENV_MISSING,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  if (!isAccess) {
    let payload: refPayload = {
      email: details.email,
      userId: details.userId,
      role: details.role,
    };

    logger.info(`[GENERATE_TOKEN] Refresh token created for user: ${details.email}, validity: ${validity}`);
    return JWT.sign(payload, key, {
      expiresIn: validity as SignOptions["expiresIn"],
    });
  } else {
    if (!id) {
      logger.error(`[GENERATE_TOKEN] Refresh token ID not provided for access token generation`);
      throw new AppError(
        COMMON_ERROR_MESSAGES.FEILD_MISSING,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    let payload: accPayload = {
      email: details.email,
      userId: details.userId,
      role: details.role,
      refId: id,
    };

    logger.info(`[GENERATE_TOKEN] Access token created for user: ${details.email}, validity: ${validity}`);
    return JWT.sign(payload, key, {
      expiresIn: validity as SignOptions["expiresIn"],
    });
  }
}
