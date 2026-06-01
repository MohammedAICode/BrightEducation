import { Request, Response } from "express";
import {
  createProfileUpdateRequest,
  getProfileUpdateRequests,
  getProfileUpdateRequestById,
  getMyProfileUpdateRequests,
  approveProfileUpdateRequest,
  rejectProfileUpdateRequest,
  deleteProfileUpdateRequest,
} from "./profileUpdate.service";
import { profileUpdateRequestSchema, profileUpdateActionSchema } from "./profileUpdate.schema";

interface ApiResponse<T = any> {
  error: boolean;
  body: T | null;
  message: string;
}

// Create a profile update request (for authenticated users)
export async function createProfileUpdateRequestHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Authentication required",
      };
      return res.status(401).json(response);
    }

    // Validate input
    const validate = profileUpdateRequestSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({
        error: true,
        message: "Validation failed",
        validationErrors: validate.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Ensure at least one field is being updated
    const hasUpdates = Object.keys(validate.data).some(
      (key) => validate.data[key as keyof typeof validate.data] !== undefined
    );

    if (!hasUpdates) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "At least one field must be provided for update",
      };
      return res.status(400).json(response);
    }

    const request = await createProfileUpdateRequest(req.user.userId, validate.data);

    const response: ApiResponse = {
      error: false,
      body: request,
      message: "Profile update request submitted successfully. Please wait for admin approval.",
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to submit profile update request",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

// Get all profile update requests (admin only)
export async function getProfileUpdateRequestsHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can view all profile update requests",
      };
      return res.status(403).json(response);
    }

    const { status } = req.query;
    const requests = await getProfileUpdateRequests(status as string);

    const response: ApiResponse = {
      error: false,
      body: requests,
      message: "Profile update requests fetched successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to fetch profile update requests",
    };
    res.status(500).json(response);
  }
}

// Get a specific profile update request by ID (admin only)
export async function getProfileUpdateRequestByIdHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can view profile update request details",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const request = await getProfileUpdateRequestById(Array.isArray(id) ? id[0] : id);

    if (!request) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Profile update request not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      error: false,
      body: request,
      message: "Profile update request fetched successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to fetch profile update request",
    };
    res.status(500).json(response);
  }
}

// Get my profile update requests (for authenticated users)
export async function getMyProfileUpdateRequestsHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Authentication required",
      };
      return res.status(401).json(response);
    }

    const requests = await getMyProfileUpdateRequests(req.user.id);

    const response: ApiResponse = {
      error: false,
      body: requests,
      message: "Your profile update requests fetched successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to fetch profile update requests",
    };
    res.status(500).json(response);
  }
}

// Approve a profile update request (admin only)
export async function approveProfileUpdateRequestHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can approve profile update requests",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const request = await approveProfileUpdateRequest(
      Array.isArray(id) ? id[0] : id,
      req.user.userId
    );

    const response: ApiResponse = {
      error: false,
      body: request,
      message: "Profile update request approved successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to approve profile update request",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

// Reject a profile update request (admin only)
export async function rejectProfileUpdateRequestHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can reject profile update requests",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await rejectProfileUpdateRequest(
      Array.isArray(id) ? id[0] : id,
      req.user.id,
      rejectionReason
    );

    const response: ApiResponse = {
      error: false,
      body: request,
      message: "Profile update request rejected successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to reject profile update request",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

// Delete a profile update request (user can delete their own pending requests)
export async function deleteProfileUpdateRequestHandler(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Authentication required",
      };
      return res.status(401).json(response);
    }

    const { id } = req.params;
    const request = await deleteProfileUpdateRequest(
      Array.isArray(id) ? id[0] : id,
      req.user.userId
    );

    const response: ApiResponse = {
      error: false,
      body: request,
      message: "Profile update request deleted successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to delete profile update request",
    };
    res.status(error.statusCode || 500).json(response);
  }
}
