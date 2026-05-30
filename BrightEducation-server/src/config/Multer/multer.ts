import multer from "multer";
import path from "path";
import logger from "../../libs/logger";

const PROFILE_IMG_PATH = process.env.PROFILE_IMG_PATH || "C:/Desktop";
const PROFILE_DIR_NAME = "bright_profileImgs";
const UPLOAD_PATH = path.join(PROFILE_IMG_PATH, PROFILE_DIR_NAME);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    logger.info(`[MULTER] Destination: ${UPLOAD_PATH}`);
    callback(null, UPLOAD_PATH);
  },
  filename(req, file, callback) {
    const email = req.body.email;
    const ext = path.extname(file.originalname);
    const filename = `${email}-${Date.now()}${ext}`;
    logger.info(`[MULTER] Filename generated: ${filename}`);
    callback(null, filename);
  },
});

// File filter to accept only images
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  logger.info(`[MULTER] File filter - Mimetype: ${file.mimetype}, Originalname: ${file.originalname}`);
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    logger.info(`[MULTER] File accepted`);
    cb(null, true);
  } else {
    logger.error(`[MULTER] File rejected - Invalid mimetype: ${file.mimetype}`);
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  }
};

// Multer instance
export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper to get the relative path for storage in database
export function getProfileImgKey(filename: string): string {
  return path.join(PROFILE_DIR_NAME, filename);
}

// Helper to construct API endpoint URL for profile image
export function getProfileImgUrl(profileImgKey: string | null): string | null {
  if (!profileImgKey) return null;
  // Extract filename from profileImgKey (e.g., "bright_profileImgs/filename.jpg" -> "filename.jpg")
  const filename = profileImgKey.split(/[/\\]/).pop();
  if (!filename) return null;
  // Return API endpoint URL
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${baseUrl}/api/v1/user/profile/${filename}`;
}
