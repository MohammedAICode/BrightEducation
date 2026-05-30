import logger from "../../libs/logger";
import { prisma } from "../../libs/prisma";
import { ensureProfileDir } from "../../utils/fileUtils";
import { AppError } from "../Error/AppError";
import { seed } from "../Seed/seed";

export async function initializer() {
  try {
    await seed();
    await ensureProfileDir();
    await validateServices();
  } catch (err: any) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

async function validateServices() {
  logger.info(`[SERVICE VALIDATION] Validating all the external services`);

  const result = await Promise.allSettled([validateDb()]);

  let hasFailure = false;
  result.forEach((res, idx) => {
    if (res.status == "rejected") {
      hasFailure = true;
      const serviceName = ["DateBase"][idx];
      logger.error(
        `[SERVICE VALIDATION] ${serviceName} validation failed: ${res.reason}`,
      );
    }
  });

  if (hasFailure) {
    throw new AppError(
      "One or more services failed validation. Check logs for details.",
    );
  }
  logger.info("[SERVICE VALIDATION] All services validated successfully");
}

async function validateDb(): Promise<void> {
  try {
    logger.info(`[DB VALIDATION] Checking database connection.`);
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info(
      `[DB VALIDATION] Database connection is validated successfully.`,
    );
  } catch (err: any) {
    logger.error(`[DB VALIDATION] Database connection failed: ${err.message}`);
    throw new AppError(
      `[DB VALIDATION] Database connection failed: ${err.message}`,
    );
  }
}
