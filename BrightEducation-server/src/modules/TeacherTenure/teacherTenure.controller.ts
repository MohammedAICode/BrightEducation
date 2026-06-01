import { Request, Response } from 'express';
import {
  createTeacherTenure,
  getAllTeacherTenures,
  getTeacherTenureById,
  updateTeacherTenure,
  deleteTeacherTenure,
} from './teacherTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, teacherId, status } = req.body;

    if (!academicYearId || !teacherId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID and teacher ID are required',
      };
      return res.status(400).json(response);
    }

    const teacherTenure = await createTeacherTenure({ 
      academicYearId, 
      teacherId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: teacherTenure,
      message: 'Teacher tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllTeacherTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId, teacherId, status } = req.query;
    const teacherTenures = await getAllTeacherTenures(
      academicYearId as string,
      teacherId as string,
      status as string
    );

    const response: ApiResponse = {
      error: false,
      body: teacherTenures,
      message: 'Teacher tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch teacher tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getTeacherTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const teacherTenure = await getTeacherTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: teacherTenure,
      message: 'Teacher tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update teacher tenures',
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

    const teacherTenure = await updateTeacherTenure(id as string, { status });

    const response: ApiResponse = {
      error: false,
      body: teacherTenure,
      message: 'Teacher tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteTeacherTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Teacher tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
