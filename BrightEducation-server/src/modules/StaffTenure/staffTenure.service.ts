import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createStaffTenure = async (data: { 
  academicYearId: string; 
  staffId: string; 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // Check if staff exists and is a staff member
    const staff = await prisma.user.findUnique({
      where: { id: data.staffId },
    });

    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    if (staff.role !== 'STAFF') {
      throw new AppError('User is not a staff member', 400);
    }

    // Check if staff already has a tenure in this academic year
    const existingTenure = await prisma.staffTenure.findUnique({
      where: {
        staffId_academicYearId: {
          staffId: data.staffId,
          academicYearId: data.academicYearId,
        },
      },
    });

    if (existingTenure) {
      throw new AppError('Staff already has a tenure in this academic year', 400);
    }

    const staffTenure = await prisma.staffTenure.create({
      data: {
        academicYearId: data.academicYearId,
        staffId: data.staffId,
        status: (data.status as any) || 'ACTIVE',
      },
      include: {
        academicYear: true,
        staff: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return staffTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create staff tenure', 500);
  }
};

export const getAllStaffTenures = async (academicYearId?: string, staffId?: string, status?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;
    
    const staffTenures = await prisma.staffTenure.findMany({
      where,
      include: {
        academicYear: true,
        staff: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        academicYear: {
          name: 'desc',
        },
      },
    });

    return staffTenures;
  } catch (error) {
    throw new AppError('Failed to fetch staff tenures', 500);
  }
};

export const getStaffTenureById = async (id: string) => {
  try {
    const staffTenure = await prisma.staffTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        staff: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!staffTenure) {
      throw new AppError('Staff tenure not found', 404);
    }

    return staffTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch staff tenure', 500);
  }
};

export const updateStaffTenure = async (id: string, data: { 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    const existingTenure = await prisma.staffTenure.findUnique({
      where: { id },
    });

    if (!existingTenure) {
      throw new AppError('Staff tenure not found', 404);
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status as any;

    const updatedTenure = await prisma.staffTenure.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        staff: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update staff tenure', 500);
  }
};

export const deleteStaffTenure = async (id: string) => {
  try {
    const staffTenure = await prisma.staffTenure.findUnique({
      where: { id },
    });

    if (!staffTenure) {
      throw new AppError('Staff tenure not found', 404);
    }

    await prisma.staffTenure.delete({
      where: { id },
    });

    return { message: 'Staff tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete staff tenure', 500);
  }
};
