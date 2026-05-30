import fs from "fs/promises";
import path from "path";
import logger from "../libs/logger";

const PROFILE_IMG_PATH = process.env.PROFILE_IMG_PATH || "C:/Desktop";
const PROFILE_DIR_NAME = "bright_profileImgs";
const UPLOAD_PATH = path.join(PROFILE_IMG_PATH, PROFILE_DIR_NAME);

export async function ensureProfileDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_PATH);
    logger.info(`[FILE_UTILS] Profile directory exists: ${UPLOAD_PATH}`);
  } catch {
    try {
      await fs.mkdir(UPLOAD_PATH, { recursive: true });
      logger.info(`[FILE_UTILS] Created profile directory: ${UPLOAD_PATH}`);
    } catch (error) {
      logger.error(`[FILE_UTILS] Failed to create profile directory: ${error}`);
      throw error;
    }
  }
}

export async function deleteProfileFile(filename: string): Promise<void> {
  const cleanFilename = filename.includes("/")
    ? filename.split("/").pop() || filename
    : filename;

  const filePath = path.join(UPLOAD_PATH, cleanFilename);
  try {
    await fs.unlink(filePath);
    logger.info(`[FILE_UTILS] Deleted profile file: ${filePath}`);
  } catch (error) {
    logger.error(`[FILE_UTILS] Failed to delete profile file: ${error}`);
    throw error;
  }
}
