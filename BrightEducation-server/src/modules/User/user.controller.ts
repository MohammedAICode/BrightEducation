import { Request, Response } from "express";
import logger from "../../libs/logger";
import { AppError } from "../../config/Error/AppError";
import {
  HTTP_STATUS,
  USER_ERROR_MESSAGES,
} from "../../config/Error/ErrorConstant";
import {
  createAdminUser,
  createUserWithManagement,
  createUserWithStaff,
  createUserWithStudent,
  createUserWithTeacher,
  getAllUsers,
  getUserById,
  softDeleteUser,
  updateUser,
  userExists,
} from "./user.service";
import {
  managementCreateInput,
  staffCreateInput,
  studentCreateInput,
  studentUserCreateInput,
  teacherCreateInput,
  userCreateInput,
} from "./user.schema";
import { protect } from "../../config/config";
import { getProfileImgKey } from "../../config/Multer/multer";
import { ROLE_TYPE } from "../../../generated/prisma/enums";

async function createUser(req: Request, res: Response) {
  try {
    const { email, role: userRole } = req.body;
    logger.info(
      `[CREATE_USER] Request to create user. Email: ${email}, Role: ${userRole}`,
    );

    // Only the admin can create users
    if (!req.user || req.user.role !== ROLE_TYPE.ADMIN) {
      logger.error(
        `[CREATE_USER] Permission denied. User: ${req.user?.email || 'unknown'}, Role: ${req.user?.role || 'unknown'}`,
      );
      throw new AppError(
        USER_ERROR_MESSAGES.USER_INVALID_PERMISSION,
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const validateUser = userCreateInput.safeParse(req.body);

    if (!validateUser.success) {
      logger.error(
        `[CREATE_USER] Validation failed for email: ${email}. Errors: ${JSON.stringify(validateUser.error.issues)}`,
      );
      throw new AppError(
        USER_ERROR_MESSAGES.USER_CREATE_INVALID,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    logger.info(
      `[CREATE_USER] Checking if user exists with email: ${validateUser.data.email}`,
    );
    const foundUser = await userExists(validateUser.data.email, null, true);

    if (foundUser) {
      logger.warn(
        `[CREATE_USER] User already exists with email: ${validateUser.data.email}`,
      );
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        data: null,
        message: "User already exists with this email",
      });
    }

    const { role, ...userFields } = validateUser.data;
    
    // Handle profile image upload - verify file was actually uploaded successfully
    let profileImgKey: string | null = null;
    let uploadedFilePath: string | null = null;
    
    logger.info(`[CREATE_USER] Checking for uploaded file. req.file exists: ${!!req.file}`);
    if (req.file) {
      logger.info(`[CREATE_USER] File details: filename=${req.file.filename}, path=${req.file.path}, size=${req.file.size}, mimetype=${req.file.mimetype}`);
    }
    
    if (req.file && req.file.path) {
      profileImgKey = getProfileImgKey(req.file.filename);
      uploadedFilePath = req.file.path;
      logger.info(`[CREATE_USER] Profile image uploaded: ${profileImgKey}`);
    } else if (userFields.profileImgKey) {
      profileImgKey = userFields.profileImgKey;
      logger.info(`[CREATE_USER] Using existing profileImgKey: ${profileImgKey}`);
    } else {
      logger.warn(`[CREATE_USER] No profile image provided`);
    }

    // Generate password: firstname@dob-year (sanitized)
    const dobYear = new Date(userFields.dateOfBirth).getFullYear();
    const sanitizedFirstname = userFields.firstname.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const generatedPassword = sanitizedFirstname ? `${sanitizedFirstname}@${dobYear}` : `user@${dobYear}`;
    logger.info(
      `[CREATE_USER] Generated password for ${userFields.firstname}: ${generatedPassword}`,
    );

    const userData: any = {
      ...userFields,
      role,
      profileImgKey,
      password: await protect(generatedPassword),
      isActive: "CREATED",
      createdById: req.user?.userId || null,
    };

    logger.info(
      `[CREATE_USER] Creating ${role} user with email: ${userData.email}`,
    );
    let result;

    try {
      switch (role) {
        case "ADMIN":
          result = await createAdminUser(userData);
          break;

        case "MANAGEMENT": {
          const validateManagement = managementCreateInput.safeParse(req.body);
          if (!validateManagement.success) {
            logger.error(
              `[CREATE_USER] Management validation failed for email: ${userData.email}. Errors: ${JSON.stringify(validateManagement.error.issues)}`,
            );
            throw new AppError(
              USER_ERROR_MESSAGES.USER_CREATE_INVALID,
              HTTP_STATUS.BAD_REQUEST,
            );
          }
          result = await createUserWithManagement(
            userData,
            validateManagement.data,
          );
          break;
        }

        case "TEACHER": {
          const validateTeacher = teacherCreateInput.safeParse(req.body);
          if (!validateTeacher.success) {
            logger.error(
              `[CREATE_USER] Teacher validation failed for email: ${userData.email}. Errors: ${JSON.stringify(validateTeacher.error.issues)}`,
            );
            throw new AppError(
              USER_ERROR_MESSAGES.USER_CREATE_INVALID,
              HTTP_STATUS.BAD_REQUEST,
            );
          }
          const teacherData = {
            ...validateTeacher.data,
            annualSalary: validateTeacher.data.annualSalary
              ? typeof validateTeacher.data.annualSalary === "string"
                ? BigInt(validateTeacher.data.annualSalary)
                : validateTeacher.data.annualSalary
              : undefined,
          };
          result = await createUserWithTeacher(userData, teacherData);
          break;
        }

        case "STAFF": {
          const validateStaff = staffCreateInput.safeParse(req.body);
          if (!validateStaff.success) {
            logger.error(
              `[CREATE_USER] Staff validation failed for email: ${userData.email}. Errors: ${JSON.stringify(validateStaff.error.issues)}`,
            );
            throw new AppError(
              USER_ERROR_MESSAGES.USER_CREATE_INVALID,
              HTTP_STATUS.BAD_REQUEST,
            );
          }
          const staffData = {
            ...validateStaff.data,
            annualSalary: validateStaff.data.annualSalary
              ? typeof validateStaff.data.annualSalary === "string"
                ? BigInt(validateStaff.data.annualSalary)
                : validateStaff.data.annualSalary
              : undefined,
          };
          result = await createUserWithStaff(userData, staffData);
          break;
        }

        case "STUDENT": {
          const validateStudentUser = studentUserCreateInput.safeParse(req.body);
          if (!validateStudentUser.success) {
            logger.error(
              `[CREATE_USER] Student user validation failed for email: ${userData.email}. Errors: ${JSON.stringify(validateStudentUser.error.issues)}`,
            );
            throw new AppError(
              USER_ERROR_MESSAGES.USER_CREATE_INVALID,
              HTTP_STATUS.BAD_REQUEST,
            );
          }
          const validateStudent = studentCreateInput.safeParse(req.body);
          if (!validateStudent.success) {
            logger.error(
              `[CREATE_USER] Student profile validation failed for email: ${userData.email}. Errors: ${JSON.stringify(validateStudent.error.issues)}`,
            );
            throw new AppError(
              USER_ERROR_MESSAGES.USER_CREATE_INVALID,
              HTTP_STATUS.BAD_REQUEST,
            );
          }
          result = await createUserWithStudent(userData, validateStudent.data);
          break;
        }

        default:
          logger.error(
            `[CREATE_USER] Invalid role: ${role} for email: ${userData.email}`,
          );
          throw new AppError("Invalid role", HTTP_STATUS.BAD_REQUEST);
      }
    } catch (err: any) {
      // If DB operation fails, delete the uploaded profile image
      if (uploadedFilePath) {
        try {
          const fs = await import("fs");
          fs.unlinkSync(uploadedFilePath);
          logger.info(
            `[CREATE_USER] Deleted uploaded profile image due to DB failure: ${uploadedFilePath}`,
          );
        } catch (deleteErr: any) {
          logger.error(
            `[CREATE_USER] Failed to delete profile image: ${deleteErr.message}`,
          );
        }
      }
      throw err;
    }

    const userEmail =
      "user" in result
        ? result.user.email
        : "email" in result
          ? result.email
          : "unknown";
    const userId =
      "user" in result
        ? result.user.id
        : "id" in result
          ? result.id
          : "unknown";
    logger.info(
      `[CREATE_USER] Successfully created ${role} user. Email: ${userEmail}, ID: ${userId}`,
    );
    return res.status(HTTP_STATUS.CREATED).json({
      error: false,
      data: result,
      message: "User created successfully",
    });
  } catch (err: any) {
    logger.error(
      `[CREATE_USER] Error occurred while creating user. Error: ${err.message}, Stack: ${err.stack}`,
    );
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function getAllUsersController(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;
    const requesterRole = req.user?.role;

    logger.info(`[GET_ALL_USERS] Fetching users. Page: ${page}, Limit: ${limit}, Search: ${search}, Role: ${role}, IsActive: ${isActive}, RequesterRole: ${requesterRole}`);

    const result = await getAllUsers(page, limit, search, role, isActive, requesterRole);

    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: result,
      message: "Users fetched successfully",
    });
  } catch (err: any) {
    logger.error(
      `[GET_ALL_USERS] Error occurred while fetching users. Error: ${err.message}, Stack: ${err.stack}`,
    );
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function softDeleteUserController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const requesterRole = req.user?.role;

    // Only admin can delete users
    if (requesterRole !== "ADMIN") {
      logger.warn(`[SOFT_DELETE_USER] Permission denied. RequesterRole: ${requesterRole}`);
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: true,
        data: null,
        message: "Invalid permission. Only admin can delete users.",
      });
    }

    logger.info(`[SOFT_DELETE_USER] Soft deleting user. ID: ${userIdStr}`);

    const deletedUser = await softDeleteUser(userIdStr);

    logger.info(`[SOFT_DELETE_USER] User soft deleted successfully. ID: ${userIdStr}`);

    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: deletedUser,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    logger.error(
      `[SOFT_DELETE_USER] Error occurred while deleting user. Error: ${err.message}, Stack: ${err.stack}`,
    );
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function updateUserController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const updateData = req.body;
    const requesterRole = req.user?.role;

    // Only admin can update users
    if (requesterRole !== "ADMIN") {
      logger.warn(`[UPDATE_USER] Permission denied. RequesterRole: ${requesterRole}`);
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: true,
        data: null,
        message: "Invalid permission. Only admin can update users.",
      });
    }

    logger.info(`[UPDATE_USER] Updating user. ID: ${userIdStr}`);

    // If profile image was uploaded, add profileImgKey to updateData
    if (req.file) {
      updateData.profileImgKey = req.file.filename;
      logger.info(`[UPDATE_USER] Profile image uploaded. Filename: ${req.file.filename}`);
    }

    const updatedUser = await updateUser(userIdStr, updateData);

    logger.info(`[UPDATE_USER] User updated successfully. ID: ${userIdStr}`);

    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (err: any) {
    logger.error(
      `[UPDATE_USER] Error occurred while updating user. Error: ${err.message}, Stack: ${err.stack}`,
    );
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function getUserByIdController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;

    logger.info(`[GET_USER_BY_ID] Fetching user details. ID: ${userIdStr}`);

    const result = await getUserById(userIdStr);

    if (!result) {
      logger.warn(`[GET_USER_BY_ID] User not found. ID: ${userIdStr}`);
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: true,
        data: null,
        message: "User not found",
      });
    }

    logger.info(`[GET_USER_BY_ID] User details fetched successfully. ID: ${userIdStr}`);

    return res.status(HTTP_STATUS.OK).json({
      error: false,
      data: result,
      message: "User details fetched successfully",
    });
  } catch (err: any) {
    logger.error(
      `[GET_USER_BY_ID] Error occurred while fetching user details. Error: ${err.message}, Stack: ${err.stack}`,
    );
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function getProfileImageController(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const filenameStr = Array.isArray(filename) ? filename[0] : filename;

    logger.info(`[GET_PROFILE_IMAGE] Fetching profile image. Filename: ${filenameStr}`);

    const fs = await import("fs");
    const path = await import("path");

    const PROFILE_IMG_PATH = process.env.PROFILE_IMG_PATH || "C:/Desktop";
    const PROFILE_DIR_NAME = "bright_profileImgs";
    const imagePath = path.join(PROFILE_IMG_PATH, PROFILE_DIR_NAME, filenameStr);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      logger.warn(`[GET_PROFILE_IMAGE] Image not found. Path: ${imagePath}`);
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: true,
        data: null,
        message: "Image not found",
      });
    }

    logger.info(`[GET_PROFILE_IMAGE] Sending image. Path: ${imagePath}`);

    // Send the file
    res.sendFile(imagePath);
  } catch (err: any) {
    logger.error(
      `[GET_PROFILE_IMAGE] Error occurred while fetching profile image. Error: ${err.message}, Stack: ${err.stack}`,
    );
    throw new AppError(err.message, err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export { createUser, getAllUsersController as getAllUsers, softDeleteUserController as softDeleteUser, updateUserController as updateUser, getUserByIdController as getUserById, getProfileImageController as getProfileImage };
