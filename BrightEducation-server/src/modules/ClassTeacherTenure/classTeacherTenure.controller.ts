import { Request, Response } from 'express';
import {
  createClassTeacherTenure,
  getAllClassTeacherTenures,
  getClassTeacherTenureById,
  updateClassTeacherTenure,
  deleteClassTeacherTenure,
} from './classTeacherTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createClassTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create class teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create class teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, sectionTenureId, teacherId, status } = req.body;

    if (!academicYearId || !sectionTenureId || !teacherId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID, section tenure ID, and teacher ID are required',
      };
      return res.status(400).json(response);
    }

    const classTeacherTenure = await createClassTeacherTenure({ 
      academicYearId, 
      sectionTenureId, 
      teacherId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: classTeacherTenure,
      message: 'Class teacher tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create class teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllClassTeacherTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId, sectionTenureId, teacherId, status } = req.query;
    const classTeacherTenures = await getAllClassTeacherTenures(
      academicYearId as string,
      sectionTenureId as string,
      teacherId as string,
      status as string
    );

    const response: ApiResponse = {
      error: false,
      body: classTeacherTenures,
      message: 'Class teacher tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch class teacher tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getClassTeacherTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const classTeacherTenure = await getClassTeacherTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: classTeacherTenure,
      message: 'Class teacher tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch class teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateClassTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update class teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update class teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { teacherId, status } = req.body;

    if (!teacherId && !status) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'At least one field (teacherId or status) is required',
      };
      return res.status(400).json(response);
    }

    const classTeacherTenure = await updateClassTeacherTenure(id as string, { 
      teacherId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: classTeacherTenure,
      message: 'Class teacher tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update class teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteClassTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete class teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete class teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteClassTeacherTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Class teacher tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete class teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
