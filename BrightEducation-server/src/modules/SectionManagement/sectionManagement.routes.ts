import { Router } from 'express';
import {
  getSectionDetailsHandler,
  getAvailableTeachersHandler,
  assignSubjectTeacherHandler,
  assignClassTeacherHandler,
  removeSubjectTeacherHandler,
  removeClassTeacherHandler,
  updateSubjectTeacherStatusHandler,
} from './sectionManagement.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get section details with all assignments
router.get('/section/:sectionId', getSectionDetailsHandler);

// Get available teachers for assignment
router.get('/teachers/available/:academicYearId', getAvailableTeachersHandler);

// Assign subject teacher to section
router.post('/subject-teacher/assign', assignSubjectTeacherHandler);

// Assign class teacher to section
router.post('/class-teacher/assign', assignClassTeacherHandler);

// Remove subject teacher assignment
router.delete('/subject-teacher/:assignmentId', removeSubjectTeacherHandler);

// Remove class teacher assignment
router.delete('/class-teacher/:sectionId', removeClassTeacherHandler);

// Update subject teacher tenure status
router.patch('/subject-teacher/:assignmentId/status', updateSubjectTeacherStatusHandler);

export default router;
