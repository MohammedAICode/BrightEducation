import { ProfileUpdateRequest, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../config/Error/AppError";
import { HTTP_STATUS } from "../../config/Error/ErrorConstant";
import { REQUEST_STATUS } from "./profileUpdate.schema";

export async function createProfileUpdateRequest(
  userId: string,
  data: Prisma.ProfileUpdateRequestCreateInput,
): Promise<ProfileUpdateRequest> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  // Check if there's already a pending request for this user
  const existingPendingRequest = await prisma.profileUpdateRequest.findFirst({
    where: {
      userId,
      status: REQUEST_STATUS.PENDING,
    },
  });

  if (existingPendingRequest) {
    throw new AppError(
      "You already have a pending profile update request. Please wait for it to be processed.",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Create the profile update request
  return await prisma.profileUpdateRequest.create({
    data: {
      ...data,
      userId,
      status: REQUEST_STATUS.PENDING,
    },
  });
}

export async function getProfileUpdateRequests(
  status?: string,
): Promise<ProfileUpdateRequest[]> {
  const where: Prisma.ProfileUpdateRequestWhereInput = {};

  if (status) {
    where.status = status as any;
  }

  return await prisma.profileUpdateRequest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProfileUpdateRequestById(
  id: string,
): Promise<ProfileUpdateRequest | null> {
  return await prisma.profileUpdateRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  });
}

export async function getMyProfileUpdateRequests(
  userId: string,
): Promise<ProfileUpdateRequest[]> {
  return await prisma.profileUpdateRequest.findMany({
    where: { userId },
    include: {
      approvedBy: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveProfileUpdateRequest(
  id: string,
  adminId: string,
): Promise<ProfileUpdateRequest> {
  // Get the request
  const request = await prisma.profileUpdateRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Profile update request not found", HTTP_STATUS.NOT_FOUND);
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw new AppError(
      "This request has already been processed",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // Build update data with only non-null fields
  const updateData: Prisma.UserUpdateInput = {};
  
  if (request.firstname !== null) updateData.firstname = request.firstname;
  if (request.lastname !== null) updateData.lastname = request.lastname;
  if (request.gender !== null) updateData.gender = request.gender;
  if (request.dateOfBirth !== null) updateData.dateOfBirth = request.dateOfBirth;
  if (request.phone !== null) updateData.phone = request.phone;
  if (request.address !== null) updateData.address = request.address;
  if (request.emergencyContactRelation !== null) updateData.emergencyContactRelation = request.emergencyContactRelation;
  if (request.emergencyContact !== null) updateData.emergencyContact = request.emergencyContact;
  if (request.bloodGroup !== null) updateData.bloodGroup = request.bloodGroup;
  if (request.nationality !== null) updateData.nationality = request.nationality;
  if (request.religion !== null) updateData.religion = request.religion;
  if (request.parentRelation !== null) updateData.parentRelation = request.parentRelation;
  if (request.parentName !== null) updateData.parentName = request.parentName;
  if (request.parentPhone !== null) updateData.parentPhone = request.parentPhone;
  if (request.parentOccupation !== null) updateData.parentOccupation = request.parentOccupation;

  // Update the user's profile
  await prisma.user.update({
    where: { id: request.userId },
    data: updateData,
  });

  // Update the request status
  return await prisma.profileUpdateRequest.update({
    where: { id },
    data: {
      status: REQUEST_STATUS.APPROVED,
      approvedById: adminId,
    },
  });
}

export async function rejectProfileUpdateRequest(
  id: string,
  adminId: string,
  rejectionReason?: string,
): Promise<ProfileUpdateRequest> {
  // Get the request
  const request = await prisma.profileUpdateRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Profile update request not found", HTTP_STATUS.NOT_FOUND);
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw new AppError(
      "This request has already been processed",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // Update the request status
  return await prisma.profileUpdateRequest.update({
    where: { id },
    data: {
      status: REQUEST_STATUS.REJECTED,
      approvedById: adminId,
      rejectionReason,
    },
  });
}

export async function deleteProfileUpdateRequest(
  id: string,
  userId: string,
): Promise<ProfileUpdateRequest> {
  // Get the request
  const request = await prisma.profileUpdateRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Profile update request not found", HTTP_STATUS.NOT_FOUND);
  }

  // Only allow deletion if the request belongs to the user and is pending
  if (request.userId !== userId) {
    throw new AppError(
      "You can only delete your own requests",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw new AppError(
      "You can only delete pending requests",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return await prisma.profileUpdateRequest.delete({
    where: { id },
  });
}
