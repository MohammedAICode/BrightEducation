import { Request, Response } from 'express';
import {
  createClassTenure,
  getAllClassTenures,
  getClassTenureById,
  updateClassTenure,
  deleteClassTenure,
} from './classTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createClassTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create class tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create class tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, name } = req.body;

    if (!academicYearId || !name) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID and name are required',
      };
      return res.status(400).json(response);
    }

    const classTenure = await createClassTenure({ academicYearId, name });

    const response: ApiResponse = {
      error: false,
      body: classTenure,
      message: 'Class tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create class tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllClassTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId } = req.query;
    const classTenures = await getAllClassTenures(academicYearId as string);

    const response: ApiResponse = {
      error: false,
      body: classTenures,
      message: 'Class tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch class tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getClassTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const classTenure = await getClassTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: classTenure,
      message: 'Class tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch class tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateClassTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update class tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update class tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { name, rollNoPrefix } = req.body;

    if (!name && rollNoPrefix === undefined) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'At least one field (name or rollNoPrefix) is required for update',
      };
      return res.status(400).json(response);
    }

    // Validate roll number prefix format if provided
    if (rollNoPrefix && !/^[A-Z]{1,3}-$/.test(rollNoPrefix)) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Roll number prefix must be 1-3 uppercase letters followed by a hyphen (e.g., P-, PP-, SEC-)',
      };
      return res.status(400).json(response);
    }

    const updateData: { name?: string; rollNoPrefix?: string } = {};
    if (name) updateData.name = name;
    if (rollNoPrefix !== undefined) updateData.rollNoPrefix = rollNoPrefix;

    const classTenure = await updateClassTenure(id as string, updateData);

    const response: ApiResponse = {
      error: false,
      body: classTenure,
      message: 'Class tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update class tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteClassTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete class tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete class tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteClassTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Class tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete class tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
