import { Request, Response } from 'express';
import {
  createSectionTenure,
  getAllSectionTenures,
  getSectionTenureById,
  updateSectionTenure,
  deleteSectionTenure,
} from './sectionTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createSectionTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create section tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create section tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, classTenureId, name, capacity, rollNoPrefix } = req.body;

    if (!academicYearId || !classTenureId || !name || !capacity) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID, class tenure ID, name, and capacity are required',
      };
      return res.status(400).json(response);
    }

    // Validate roll number prefix format if provided
    if (rollNoPrefix && !/^[A-Z]{1,3}-$/.test(rollNoPrefix)) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Roll number prefix must be 1-3 uppercase letters followed by a hyphen (e.g., A-, B-, SEC-)',
      };
      return res.status(400).json(response);
    }

    const sectionTenure = await createSectionTenure({ academicYearId, classTenureId, name, capacity, rollNoPrefix });

    const response: ApiResponse = {
      error: false,
      body: sectionTenure,
      message: 'Section tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create section tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllSectionTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId, classTenureId } = req.query;
    const sectionTenures = await getAllSectionTenures(
      academicYearId as string,
      classTenureId as string
    );

    const response: ApiResponse = {
      error: false,
      body: sectionTenures,
      message: 'Section tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch section tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getSectionTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sectionTenure = await getSectionTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: sectionTenure,
      message: 'Section tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch section tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateSectionTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update section tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update section tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { name, capacity, rollNoPrefix } = req.body;

    if (!name && capacity === undefined) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Name or capacity is required',
      };
      return res.status(400).json(response);
    }

    // Validate roll number prefix format if provided
    if (rollNoPrefix && !/^[A-Z]{1,3}-$/.test(rollNoPrefix)) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Roll number prefix must be 1-3 uppercase letters followed by a hyphen (e.g., A-, B-, SEC-)',
      };
      return res.status(400).json(response);
    }

    const sectionTenure = await updateSectionTenure(id as string, { name, capacity, rollNoPrefix });

    const response: ApiResponse = {
      error: false,
      body: sectionTenure,
      message: 'Section tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update section tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteSectionTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete section tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete section tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteSectionTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Section tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete section tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
