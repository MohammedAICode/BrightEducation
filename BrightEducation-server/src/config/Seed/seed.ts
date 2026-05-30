import { Gender, Prisma, ROLE_TYPE } from "../../../generated/prisma/client";
import logger from "../../libs/logger";
import { createAdminUser, userExists } from "../../modules/User/user.service";
import { protect } from "../config";
import { AppError } from "../Error/AppError";
import {
  COMMON_ERROR_MESSAGES,
  HTTP_STATUS,
  SEED_ERROR_MESSAGES,
} from "../Error/ErrorConstant";

export async function seed() {
  try {
    logger.info(`[SEED] Executing the seed.`);
    // verify whether the user exists or not.
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      logger.error(
        `[SEED] Environmental variables are not found (or) Not configured correctly.`,
      );
      throw new AppError(
        COMMON_ERROR_MESSAGES.ENV_MISSING,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await userExists(email, null, true);

    if (!result) {
      logger.info(
        `[SEED] Admin not found in the db. Trying to create the admin.`,
      );

      const userInput: Prisma.UserCreateInput = {
        email: email,
        role: ROLE_TYPE.ADMIN,
        isActive: "ACTIVE",
        password: await protect(password),
        address:"Bandlaguda Chandrayangutta, HYD.",
        dateOfBirth: new Date(),
        emergencyContact: "91-998877665",
        emergencyContactRelation: "Others",
        firstname: "Bright",
        lastname: "Admin",
        gender: Gender.MALE
      };

      const storedUser = await createAdminUser(userInput);

      logger.info(
        `[SEED] Admin has been successfully created, \n email: ${storedUser?.email}`,
      );
    } else {
      logger.info(`[SEED] Admin already found in the db. Skiping seed.`);
    }
  } catch (err: any) {
    logger.error(`[SEED] Error Occured: ${err}`);
    throw new AppError(
      SEED_ERROR_MESSAGES.FAILED_SEED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}
