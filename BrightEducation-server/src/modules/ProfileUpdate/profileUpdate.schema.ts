import { z } from 'zod';

// Enum for request status
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// Enum for gender
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

// Schema for creating a profile update request
// All fields are optional - user only submits fields they want to change
export const profileUpdateRequestSchema = z.object({
  firstname: z.string().min(1, 'First name is required').optional(),
  lastname: z.string().optional(),
  gender: z.enum([GENDER.MALE, GENDER.FEMALE]).optional(),
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  phone: z.string().optional(),
  address: z.string().min(1, 'Address is required').optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  parentRelation: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentOccupation: z.string().optional(),
  profileImgKey: z.string().optional(),
});

// Schema for approving/rejecting a request
export const profileUpdateActionSchema = z.object({
  status: z.enum([REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED]),
  rejectionReason: z.string().optional(),
});

// Type exports
export type ProfileUpdateRequestInput = z.infer<typeof profileUpdateRequestSchema>;
export type ProfileUpdateActionInput = z.infer<typeof profileUpdateActionSchema>;
