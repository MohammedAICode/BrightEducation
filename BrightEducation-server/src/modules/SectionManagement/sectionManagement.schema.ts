import { z } from 'zod';

// Assign subject teacher to a section
export const assignSubjectTeacherSchema = z.object({
  sectionTenureId: z.string().uuid('Invalid section ID'),
  classSubjectId: z.string().uuid('Invalid subject ID'),
  teacherId: z.string().uuid('Invalid teacher ID'),
});

// Assign class teacher to a section
export const assignClassTeacherSchema = z.object({
  sectionTenureId: z.string().uuid('Invalid section ID'),
  teacherId: z.string().uuid('Invalid teacher ID'),
});

// Remove subject teacher assignment
export const removeSubjectTeacherSchema = z.object({
  subjectTeacherTenureId: z.string().uuid('Invalid assignment ID'),
});

// Update tenure status
export const updateTenureStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'TRANSFERRED', 'RESIGNED', 'RETIRED']),
});

// Type exports
export type AssignSubjectTeacherInput = z.infer<typeof assignSubjectTeacherSchema>;
export type AssignClassTeacherInput = z.infer<typeof assignClassTeacherSchema>;
export type RemoveSubjectTeacherInput = z.infer<typeof removeSubjectTeacherSchema>;
export type UpdateTenureStatusInput = z.infer<typeof updateTenureStatusSchema>;
