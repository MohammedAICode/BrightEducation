import { Request, Response } from 'express';
import {
  createSubjectTeacherTenure,
  getAllSubjectTeacherTenures,
  getSubjectTeacherTenureById,
  updateSubjectTeacherTenure,
  deleteSubjectTeacherTenure,
} from './subjectTeacherTenure.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createSubjectTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can create subject teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create subject teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { academicYearId, sectionTenureId, classSubjectId, teacherId, status } = req.body;

    if (!academicYearId || !sectionTenureId || !classSubjectId || !teacherId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID, section tenure ID, class subject ID, and teacher ID are required',
      };
      return res.status(400).json(response);
    }

    const subjectTeacherTenure = await createSubjectTeacherTenure({ 
      academicYearId, 
      sectionTenureId, 
      classSubjectId, 
      teacherId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: subjectTeacherTenure,
      message: 'Subject teacher tenure created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create subject teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllSubjectTeacherTenuresHandler(req: Request, res: Response) {
  try {
    const { academicYearId, sectionTenureId, classSubjectId, teacherId, status } = req.query;
    const subjectTeacherTenures = await getAllSubjectTeacherTenures(
      academicYearId as string,
      sectionTenureId as string,
      classSubjectId as string,
      teacherId as string,
      status as string
    );

    const response: ApiResponse = {
      error: false,
      body: subjectTeacherTenures,
      message: 'Subject teacher tenures fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch subject teacher tenures',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getSubjectTeacherTenureByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const subjectTeacherTenure = await getSubjectTeacherTenureById(id as string);

    const response: ApiResponse = {
      error: false,
      body: subjectTeacherTenure,
      message: 'Subject teacher tenure fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch subject teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateSubjectTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can update subject teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update subject teacher tenures',
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

    const subjectTeacherTenure = await updateSubjectTeacherTenure(id as string, { 
      teacherId, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: subjectTeacherTenure,
      message: 'Subject teacher tenure updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update subject teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteSubjectTeacherTenureHandler(req: Request, res: Response) {
  try {
    // Only admin can delete subject teacher tenures
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete subject teacher tenures',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteSubjectTeacherTenure(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Subject teacher tenure deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete subject teacher tenure',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
