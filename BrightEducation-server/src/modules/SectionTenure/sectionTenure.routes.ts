import { Router } from 'express';
import {
  createSectionTenureHandler,
  getAllSectionTenuresHandler,
  getSectionTenureByIdHandler,
  updateSectionTenureHandler,
  deleteSectionTenureHandler,
} from './sectionTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/section-tenure - Create a new section tenure (Admin only)
router.post('/', createSectionTenureHandler);

// GET /api/v1/section-tenure - Get all section tenures (optionally filtered by academicYearId and/or classTenureId)
router.get('/', getAllSectionTenuresHandler);

// GET /api/v1/section-tenure/:id - Get a specific section tenure by ID
router.get('/:id', getSectionTenureByIdHandler);

// PATCH /api/v1/section-tenure/:id - Update a section tenure (Admin only)
router.patch('/:id', updateSectionTenureHandler);

// DELETE /api/v1/section-tenure/:id - Delete a section tenure (Admin only)
router.delete('/:id', deleteSectionTenureHandler);

export default router;
