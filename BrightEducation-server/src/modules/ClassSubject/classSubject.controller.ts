import { Request, Response } from 'express';
import {
  createClassSubject,
  getAllClassSubjects,
  getClassSubjectById,
  updateClassSubject,
  deleteClassSubject,
} from './classSubject.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createClassSubjectHandler(req: Request, res: Response) {
  try {
    // Only admin can create class subjects
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can create class subjects',
      };
      return res.status(403).json(response);
    }

    const { classTenureId, name } = req.body;

    if (!classTenureId || !name) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Class tenure ID and name are required',
      };
      return res.status(400).json(response);
    }

    const classSubject = await createClassSubject({ classTenureId, name });

    const response: ApiResponse = {
      error: false,
      body: classSubject,
      message: 'Class subject created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create class subject',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllClassSubjectsHandler(req: Request, res: Response) {
  try {
    const { classTenureId } = req.query;
    const classSubjects = await getAllClassSubjects(classTenureId as string);

    const response: ApiResponse = {
      error: false,
      body: classSubjects,
      message: 'Class subjects fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch class subjects',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getClassSubjectByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const classSubject = await getClassSubjectById(id as string);

    const response: ApiResponse = {
      error: false,
      body: classSubject,
      message: 'Class subject fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch class subject',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateClassSubjectHandler(req: Request, res: Response) {
  try {
    // Only admin can update class subjects
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update class subjects',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Name is required',
      };
      return res.status(400).json(response);
    }

    const classSubject = await updateClassSubject(id as string, { name });

    const response: ApiResponse = {
      error: false,
      body: classSubject,
      message: 'Class subject updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update class subject',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteClassSubjectHandler(req: Request, res: Response) {
  try {
    // Only admin can delete class subjects
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete class subjects',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteClassSubject(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Class subject deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete class subject',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
