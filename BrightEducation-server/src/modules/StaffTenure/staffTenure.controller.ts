import { Request, Response } from 'express';
import {
  createStaffTenure,
  getAllStaffTenures,
  getStaffTenureById,
  updateStaffTenure,
  deleteStaffTenure,
} from './staffTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createStaffTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create staff tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create staff tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, staffId, status } = req.body;

    if (!academicYearId || !staffId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID and staff ID are required',
      };
      return res.status(400).json(response);
    }

    const staffTenure = await createStaffTenure({ 
      academicYearId, 
      staffId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: staffTenure,
      message: 'Staff tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create staff tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllStaffTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId, staffId, status } = req.query;
    const staffTenures = await getAllStaffTenures(
      academicYearId as string,
      staffId as string,
      status as string
    );

    const response: ApiResponse = {
      error: false,
      body: staffTenures,
      message: 'Staff tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch staff tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getStaffTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const staffTenure = await getStaffTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: staffTenure,
      message: 'Staff tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch staff tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateStaffTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update staff tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update staff tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Status is required',
      };
      return res.status(400).json(response);
    }

    const staffTenure = await updateStaffTenure(id as string, { status });

    const response: ApiResponse = {
      error: false,
      body: staffTenure,
      message: 'Staff tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update staff tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteStaffTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete staff tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete staff tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteStaffTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Staff tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete staff tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
