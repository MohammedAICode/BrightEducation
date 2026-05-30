import { Router } from "express";
import { createUser, getAllUsers, getUserById, softDeleteUser, updateUser, getProfileImage } from "./user.controller";
import { uploadProfile } from "../../config/Multer/multer";
import { authenticate } from "../../config/middleware/authenticate";

export const userRouter = Router();


// CRUD
userRouter.post("/register", authenticate, uploadProfile.single("profileImg"), createUser);
userRouter.get("/all", authenticate, getAllUsers);

// Profile image (must come before /:userId to avoid route conflict)
userRouter.get("/profile/:filename", getProfileImage);

userRouter.get("/:userId", authenticate, getUserById);
userRouter.delete("/:userId", authenticate, softDeleteUser);
userRouter.put("/:userId", authenticate, uploadProfile.single("profileImg"), updateUser);
