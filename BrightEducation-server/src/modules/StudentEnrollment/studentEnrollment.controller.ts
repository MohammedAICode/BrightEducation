import { Request, Response } from 'express';
import {
  createStudentEnrollment,
  getAllStudentEnrollments,
  getStudentEnrollmentById,
  updateStudentEnrollment,
  deleteStudentEnrollment,
  batchEnrollStudents,
  batchUpdateEnrollmentStatus,
} from './studentEnrollment.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function createStudentEnrollmentHandler(req: Request, res: Response) {
  try {
    // Admin and MANAGEMENT roles can create student enrollments
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGEMENT')) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators and management can create student enrollments',
      };
      return res.status(403).json(response);
    }

    const { studentId, academicYearId, sectionTenureId, rollNumber, status } = req.body;

    if (!studentId || !academicYearId || !sectionTenureId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Student ID, academic year ID, and section tenure ID are required',
      };
      return res.status(400).json(response);
    }

    const studentEnrollment = await createStudentEnrollment({ 
      studentId, 
      academicYearId, 
      sectionTenureId, 
      rollNumber, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: studentEnrollment,
      message: 'Student enrollment created successfully',
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to create student enrollment',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getAllStudentEnrollmentsHandler(req: Request, res: Response) {
  try {
    const { academicYearId, sectionTenureId, status, page = '1', limit = '50' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const studentEnrollments = await getAllStudentEnrollments(
      academicYearId as string,
      sectionTenureId as string,
      status as string,
      skip,
      limitNum
    );

    const response: ApiResponse = {
      error: false,
      body: studentEnrollments,
      message: 'Student enrollments fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch student enrollments',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function getStudentEnrollmentByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const studentEnrollment = await getStudentEnrollmentById(id as string);

    const response: ApiResponse = {
      error: false,
      body: studentEnrollment,
      message: 'Student enrollment fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch student enrollment',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateStudentEnrollmentHandler(req: Request, res: Response) {
  try {
    // Only admin can update student enrollments
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update student enrollments',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const { sectionTenureId, rollNumber, status } = req.body;

    if (!sectionTenureId && !rollNumber && !status) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'At least one field (sectionTenureId, rollNumber, or status) is required',
      };
      return res.status(400).json(response);
    }

    const studentEnrollment = await updateStudentEnrollment(id as string, { 
      sectionTenureId, 
      rollNumber, 
      status 
    });

    const response: ApiResponse = {
      error: false,
      body: studentEnrollment,
      message: 'Student enrollment updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update student enrollment',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function deleteStudentEnrollmentHandler(req: Request, res: Response) {
  try {
    // Only admin can delete student enrollments
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can delete student enrollments',
      };
      return res.status(403).json(response);
    }

    const { id } = req.params;
    const result = await deleteStudentEnrollment(id as string);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: 'Student enrollment deleted successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to delete student enrollment',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function batchEnrollStudentsHandler(req: Request, res: Response) {
  try {
    // Admin and MANAGEMENT roles can batch enroll students
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGEMENT')) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators and management can batch enroll students',
      };
      return res.status(403).json(response);
    }

    const { studentIds, academicYearId, sectionTenureId, feeType, feeData } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Student IDs array is required and must not be empty',
      };
      return res.status(400).json(response);
    }

    if (!academicYearId || !sectionTenureId) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Academic year ID and section tenure ID are required',
      };
      return res.status(400).json(response);
    }

    const result = await batchEnrollStudents({
      studentIds,
      academicYearId,
      sectionTenureId,
      feeType,
      feeData,
    });

    const response: ApiResponse = {
      error: false,
      body: result,
      message: `Batch enrollment completed: ${result.successful.length} successful, ${result.failed.length} failed`,
    };
    return res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to batch enroll students',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function batchUpdateStatusHandler(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can batch update enrollment status',
      };
      return res.status(403).json(response);
    }

    const { enrollmentIds, status } = req.body;

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Enrollment IDs array is required and must not be empty',
      };
      return res.status(400).json(response);
    }

    if (!status) {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Status is required',
      };
      return res.status(400).json(response);
    }

    const result = await batchUpdateEnrollmentStatus({ enrollmentIds, status });

    const response: ApiResponse = {
      error: false,
      body: result,
      message: `Batch status update completed: ${result.updated} enrollment(s) updated`,
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to batch update enrollment status',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
