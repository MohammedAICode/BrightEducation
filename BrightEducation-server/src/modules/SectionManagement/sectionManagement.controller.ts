import { Request, Response } from 'express';
import {
  getSectionDetails,
  getAvailableTeachers,
  assignSubjectTeacher,
  assignClassTeacher,
  removeSubjectTeacher,
  removeClassTeacher,
  updateSubjectTeacherStatus,
} from './sectionManagement.service';
import {
  assignSubjectTeacherSchema,
  assignClassTeacherSchema,
  removeSubjectTeacherSchema,
  updateTenureStatusSchema,
} from './sectionManagement.schema';

interface ApiResponse<T = any> {
  error: boolean;
  body: T | null;
  message: string;
}

/**
 * Get section details with all assignments
 */
export async function getSectionDetailsHandler(req: Request, res: Response) {
  try {
    const sectionId = req.params.sectionId as string;

    const section = await getSectionDetails(sectionId);

    const response: ApiResponse = {
      error: false,
      body: section,
      message: 'Section details retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to retrieve section details',
    };
    res.status(error.statusCode || 500).json(response);
  }
}

/**
 * Get available teachers for assignment
 */
export async function getAvailableTeachersHandler(req: Request, res: Response) {
  try {
    const academicYearId = req.params.academicYearId as string;
    const subject = req.query.subject as string | undefined;

    const teachers = await getAvailableTeachers(
      academicYearId,
      subject
    );

    // Convert BigInt to string to avoid JSON serialization error
    const serializedTeachers = JSON.parse(
      JSON.stringify(teachers, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    const response: ApiResponse = {
      error: false,
      body: serializedTeachers,
      message: 'Available teachers retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to retrieve available teachers',
    };
    res.status(error.statusCode || 500).json(response);
  }
}

/**
 * Assign subject teacher to section
 */
export async function assignSubjectTeacherHandler(req: Request, res: Response) {
  try {
    const validate = assignSubjectTeacherSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        validationErrors: validate.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { sectionTenureId, classSubjectId, teacherId } = validate.data;

    const assignment = await assignSubjectTeacher(
      sectionTenureId,
      classSubjectId,
      teacherId
    );

    const response: ApiResponse = {
      error: false,
      body: assignment,
      message: 'Subject teacher assigned successfully',
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to assign subject teacher',
    };
    res.status(error.statusCode || 500).json(response);
  }
}

/**
 * Assign class teacher to section
 */
export async function assignClassTeacherHandler(req: Request, res: Response) {
  try {
    const validate = assignClassTeacherSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        validationErrors: validate.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { sectionTenureId, teacherId } = validate.data;

    const assignment = await assignClassTeacher(sectionTenureId, teacherId);

    const response: ApiResponse = {
      error: false,
      body: assignment,
      message: 'Class teacher assigned successfully',
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to assign class teacher',
    };
    res.status(error.statusCode || 500).json(response);
  }
}

/**
 * Remove subject teacher assignment
 */
export async function removeSubjectTeacherHandler(req: Request, res: Response) {
  try {
    const assignmentId = req.params.assignmentId as string;

    const result = await removeSubjectTeacher(assignmentId);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: result.message,
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to remove subject teacher',
    };
    res.status(error.statusCode || 500).json(response);
  }
}

/**
 * Remove class teacher assignment
 */
export async function removeClassTeacherHandler(req: Request, res: Response) {
  try {
    const sectionId = req.params.sectionId as string;

    const result = await removeClassTeacher(sectionId);

    const response: ApiResponse = {
      error: false,
      body: result,
      message: result.message,
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to remove class teacher',
    };
    res.status(error.statusCode || 500).json(response);
  }
}

/**
 * Update subject teacher tenure status
 */
export async function updateSubjectTeacherStatusHandler(req: Request, res: Response) {
  try {
    const assignmentId = req.params.assignmentId as string;
    const validate = updateTenureStatusSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        validationErrors: validate.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { status } = validate.data;

    const assignment = await updateSubjectTeacherStatus(assignmentId, status);

    const response: ApiResponse = {
      error: false,
      body: assignment,
      message: 'Teacher assignment status updated successfully',
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update assignment status',
    };
    res.status(error.statusCode || 500).json(response);
  }
}
