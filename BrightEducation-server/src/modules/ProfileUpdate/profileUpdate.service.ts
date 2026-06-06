import { ProfileUpdateRequest, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../config/Error/AppError";
import { HTTP_STATUS } from "../../config/Error/ErrorConstant";
import { REQUEST_STATUS } from "./profileUpdate.schema";
import { createNotification, NotificationType, NotificationStatus, NotificationPriority } from "../Notification/notification.service";

export async function createProfileUpdateRequest(
  userId: string,
  data: Partial<Prisma.ProfileUpdateRequestUncheckedCreateInput>,
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
      "There is already a pending profile update request for this user. Please wait for it to be processed.",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Filter out undefined/null/empty values - only include fields that are actually being updated
  const cleanData: any = {};
  const fieldsToCheck = [
    'requesterId', 'reason', 'firstname', 'lastname', 'gender', 'dateOfBirth',
    'phone', 'address', 'emergencyContactRelation', 'emergencyContact', 'bloodGroup',
    'nationality', 'religion', 'parentRelation', 'parentName', 'parentPhone',
    'parentOccupation', 'profileImgKey'
  ];

  for (const field of fieldsToCheck) {
    const value = data[field as keyof typeof data];
    // Only include if the value is defined, not null, and not an empty string
    if (value !== undefined && value !== null && value !== '') {
      cleanData[field] = value;
    }
  }

  // Create the profile update request
  return await prisma.profileUpdateRequest.create({
    data: {
      ...cleanData,
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
      requester: {
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
      requester: {
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
  if (request.profileImgKey !== null) updateData.profileImgKey = request.profileImgKey;

  // Update the user's profile
  await prisma.user.update({
    where: { id: request.userId },
    data: updateData,
  });

  // Update the request status
  const updatedRequest = await prisma.profileUpdateRequest.update({
    where: { id },
    data: {
      status: REQUEST_STATUS.APPROVED,
      approvedById: adminId,
    },
  });

  // Send notification to user
  try {
    await createNotification({
      type: NotificationType.PROFILE_UPDATE,
      status: NotificationStatus.COMPLETED,
      userId: request.userId,
      relatedUserId: adminId,
      title: "Profile Update Approved",
      message: "Your profile update request has been approved by the administrator. Your changes are now live.",
      priority: NotificationPriority.NORMAL,
      data: {
        requestId: id,
        approvedBy: adminId,
      },
    });
  } catch (notifError: any) {
    // Log error but don't fail the approval
    console.error("Failed to send notification:", notifError);
  }

  return updatedRequest;
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
  const updatedRequest = await prisma.profileUpdateRequest.update({
    where: { id },
    data: {
      status: REQUEST_STATUS.REJECTED,
      approvedById: adminId,
      rejectionReason,
    },
  });

  // Send notification to user
  try {
    await createNotification({
      type: NotificationType.PROFILE_UPDATE,
      status: NotificationStatus.REJECTED,
      userId: request.userId,
      relatedUserId: adminId,
      title: "Profile Update Rejected",
      message: rejectionReason 
        ? `Your profile update request has been rejected. Reason: ${rejectionReason}`
        : "Your profile update request has been rejected by the administrator.",
      priority: NotificationPriority.NORMAL,
      data: {
        requestId: id,
        rejectedBy: adminId,
        rejectionReason,
      },
    });
  } catch (notifError: any) {
    // Log error but don't fail the rejection
    console.error("Failed to send notification:", notifError);
  }

  return updatedRequest;
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
