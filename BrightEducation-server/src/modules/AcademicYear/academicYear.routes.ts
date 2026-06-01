import { Router } from "express";
import {
  createAcademicYearHandler,
  getAllAcademicYearsHandler,
  getAcademicYearByIdHandler,
  getActiveAcademicYearHandler,
  updateAcademicYearHandler,
  activateAcademicYearHandler,
  deactivateAcademicYearHandler,
  deleteAcademicYearHandler,
} from "./academicYear.controller";
import { authenticate } from "../../config/middleware/authenticate";

export const academicYearRouter = Router();

// Public routes (if needed) - currently all require authentication
academicYearRouter.post("/", authenticate, createAcademicYearHandler);
academicYearRouter.get("/", authenticate, getAllAcademicYearsHandler);
academicYearRouter.get("/active", authenticate, getActiveAcademicYearHandler);
academicYearRouter.get("/:id", authenticate, getAcademicYearByIdHandler);
academicYearRouter.put("/:id", authenticate, updateAcademicYearHandler);
academicYearRouter.patch("/:id/activate", authenticate, activateAcademicYearHandler);
academicYearRouter.patch("/:id/deactivate", authenticate, deactivateAcademicYearHandler);
academicYearRouter.delete("/:id", authenticate, deleteAcademicYearHandler);
