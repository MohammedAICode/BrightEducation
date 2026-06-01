import { Router } from 'express';
import {
  createManagementTenureHandler,
  getAllManagementTenuresHandler,
  getManagementTenureByIdHandler,
  updateManagementTenureHandler,
  deleteManagementTenureHandler,
} from './managementTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/management-tenure - Create a new management tenure (Admin only)
router.post('/', createManagementTenureHandler);

// GET /api/v1/management-tenure - Get all management tenures (optionally filtered by academicYearId, managementId, status)
router.get('/', getAllManagementTenuresHandler);

// GET /api/v1/management-tenure/:id - Get a specific management tenure by ID
router.get('/:id', getManagementTenureByIdHandler);

// PUT /api/v1/management-tenure/:id - Update a management tenure (Admin only)
router.put('/:id', updateManagementTenureHandler);

// DELETE /api/v1/management-tenure/:id - Delete a management tenure (Admin only)
router.delete('/:id', deleteManagementTenureHandler);

export default router;
