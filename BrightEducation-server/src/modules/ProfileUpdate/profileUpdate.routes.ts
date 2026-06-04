import { Router } from "express";
import {
  createProfileUpdateRequestHandler,
  getProfileUpdateRequestsHandler,
  getProfileUpdateRequestByIdHandler,
  getMyProfileUpdateRequestsHandler,
  approveProfileUpdateRequestHandler,
  rejectProfileUpdateRequestHandler,
  deleteProfileUpdateRequestHandler,
} from "./profileUpdate.controller";
import { authenticate } from "../../config/middleware/authenticate";
import { uploadProfile } from "../../config/Multer/multer";

const profileUpdateRouter = Router();

// All routes require authentication
profileUpdateRouter.use(authenticate);

// Create a profile update request (any authenticated user)
profileUpdateRouter.post("/", uploadProfile.single('profileImg'), createProfileUpdateRequestHandler);

// Get my profile update requests (any authenticated user)
profileUpdateRouter.get("/my-requests", getMyProfileUpdateRequestsHandler);

// Get all profile update requests (admin only)
profileUpdateRouter.get("/", getProfileUpdateRequestsHandler);

// Get a specific profile update request by ID (admin only)
profileUpdateRouter.get("/:id", getProfileUpdateRequestByIdHandler);

// Approve a profile update request (admin only)
profileUpdateRouter.put("/:id/approve", approveProfileUpdateRequestHandler);

// Reject a profile update request (admin only)
profileUpdateRouter.put("/:id/reject", rejectProfileUpdateRequestHandler);

// Delete a profile update request (user can delete their own pending requests)
profileUpdateRouter.delete("/:id", deleteProfileUpdateRequestHandler);

export default profileUpdateRouter;
