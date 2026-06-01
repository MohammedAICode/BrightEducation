import { Request, Response } from 'express';
import {
  createManagementTenure,
  getAllManagementTenures,
  getManagementTenureById,
  updateManagementTenure,
  deleteManagementTenure,
} from './managementTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createManagementTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create management tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create management tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, managementId, status } = req.body;

    if (!academicYearId || !managementId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID and management ID are required',
      };
      return res.status(400).json(response);
    }

    const managementTenure = await createManagementTenure({ 
      academicYearId, 
      managementId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: managementTenure,
      message: 'Management tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create management tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllManagementTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId, managementId, status } = req.query;
    const managementTenures = await getAllManagementTenures(
      academicYearId as string,
      managementId as string,
      status as string
    );

    const response: ApiResponse = {
      error: false,
      body: managementTenures,
      message: 'Management tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch management tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getManagementTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const managementTenure = await getManagementTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: managementTenure,
      message: 'Management tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch management tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateManagementTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update management tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update management tenures',
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

    const managementTenure = await updateManagementTenure(id as string, { status });

    const response: ApiResponse = {
      error: false,
      body: managementTenure,
      message: 'Management tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update management tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteManagementTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete management tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete management tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteManagementTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Management tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete management tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
