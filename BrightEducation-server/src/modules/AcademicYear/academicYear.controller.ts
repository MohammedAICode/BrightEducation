import { Request, Response } from "express";
import {
  createAcademicYear,
  getAllAcademicYears,
  getAcademicYearById,
  getActiveAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  deactivateAcademicYear,
  deleteAcademicYear,
} from "./academicYear.service";

interface ApiResponse<T = any> {
  error: boolean;
  body: T | null;
  message: string;
}

export async function createAcademicYearHandler(
  req: Request,
  res: Response,
) {
  try {
    // Only admin can create academic years
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can create academic years",
      };
      return res.status(403).json(response);
    }

    const { name, startDate, endDate, isActive } = req.body;

    if (!name || !startDate || !endDate) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "name, startDate, and endDate are required",
      };
      return res.status(400).json(response);
    }

    const academicYear = await createAcademicYear({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive || false,
    });

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Academic year created successfully",
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to create academic year",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllAcademicYearsHandler(
  req: Request,
  res: Response,
) {
  try {
    const academicYears = await getAllAcademicYears();
    const response: ApiResponse = {
      error: false,
      body: academicYears,
      message: "Academic years fetched successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to fetch academic years",
    };
    res.status(500).json(response);
  }
}

export async function getAcademicYearByIdHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;
    const academicYear = await getAcademicYearById(Array.isArray(id) ? id[0] : id);

    if (!academicYear) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Academic year not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Academic year fetched successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to fetch academic year",
    };
    res.status(500).json(response);
  }
}

export async function getActiveAcademicYearHandler(
  req: Request,
  res: Response,
) {
  try {
    const academicYear = await getActiveAcademicYear();

    if (!academicYear) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "No active academic year found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Active academic year fetched successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to fetch active academic year",
    };
    res.status(500).json(response);
  }
}

export async function updateAcademicYearHandler(
  req: Request,
  res: Response,
) {
  try {
    // Only admin can update academic years
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can update academic years",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { name, startDate, endDate, isActive } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    const academicYear = await updateAcademicYear(Array.isArray(id) ? id[0] : id, updateData);

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Academic year updated successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to update academic year",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

export async function activateAcademicYearHandler(
  req: Request,
  res: Response,
) {
  try {
    // Only admin can activate academic years
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can activate academic years",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const academicYear = await activateAcademicYear(Array.isArray(id) ? id[0] : id);

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Academic year activated successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to activate academic year",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

export async function deactivateAcademicYearHandler(
  req: Request,
  res: Response,
) {
  try {
    // Only admin can deactivate academic years
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can deactivate academic years",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const academicYear = await deactivateAcademicYear(Array.isArray(id) ? id[0] : id);

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Academic year deactivated successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to deactivate academic year",
    };
    res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteAcademicYearHandler(
  req: Request,
  res: Response,
) {
  try {
    // Only admin can delete academic years
    if (!req.user || req.user.role !== "ADMIN") {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: "Only administrators can delete academic years",
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const academicYear = await deleteAcademicYear(Array.isArray(id) ? id[0] : id);

    const response: ApiResponse = {
      error: false,
      body: academicYear,
      message: "Academic year deleted successfully",
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || "Failed to delete academic year",
    };
    res.status(error.statusCode || 500).json(response);
  }
}
