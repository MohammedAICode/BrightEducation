import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createManagementTenure = async (data: { 
  academicYearId: string; 
  managementId: string; 
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

    // Check if management exists and is a management member
    const management = await prisma.user.findUnique({
      where: { id: data.managementId },
    });

    if (!management) {
      throw new AppError('Management not found', 404);
    }

    if (management.role !== 'MANAGEMENT') {
      throw new AppError('User is not a management member', 400);
    }

    // Check if management already has a tenure in this academic year
    const existingTenure = await prisma.managementTenure.findUnique({
      where: {
        managementId_academicYearId: {
          managementId: data.managementId,
          academicYearId: data.academicYearId,
        },
      },
    });

    if (existingTenure) {
      throw new AppError('Management already has a tenure in this academic year', 400);
    }

    const managementTenure = await prisma.managementTenure.create({
      data: {
        academicYearId: data.academicYearId,
        managementId: data.managementId,
        status: (data.status as any) || 'ACTIVE',
      },
      include: {
        academicYear: true,
        management: {
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

    return managementTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create management tenure', 500);
  }
};

export const getAllManagementTenures = async (academicYearId?: string, managementId?: string, status?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (managementId) where.managementId = managementId;
    if (status) where.status = status;
    
    const managementTenures = await prisma.managementTenure.findMany({
      where,
      include: {
        academicYear: true,
        management: {
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

    return managementTenures;
  } catch (error) {
    throw new AppError('Failed to fetch management tenures', 500);
  }
};

export const getManagementTenureById = async (id: string) => {
  try {
    const managementTenure = await prisma.managementTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        management: {
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

    if (!managementTenure) {
      throw new AppError('Management tenure not found', 404);
    }

    return managementTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch management tenure', 500);
  }
};

export const updateManagementTenure = async (id: string, data: { 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    const existingTenure = await prisma.managementTenure.findUnique({
      where: { id },
    });

    if (!existingTenure) {
      throw new AppError('Management tenure not found', 404);
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status as any;

    const updatedTenure = await prisma.managementTenure.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        management: {
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
    throw new AppError('Failed to update management tenure', 500);
  }
};

export const deleteManagementTenure = async (id: string) => {
  try {
    const managementTenure = await prisma.managementTenure.findUnique({
      where: { id },
    });

    if (!managementTenure) {
      throw new AppError('Management tenure not found', 404);
    }

    await prisma.managementTenure.delete({
      where: { id },
    });

    return { message: 'Management tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete management tenure', 500);
  }
};

export const getManagementByType = async (manageType: string) => {
  try {
    const managementUsers = await prisma.management.findMany({
      where: {
        manageType: manageType as any,
      },
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
      },
    });

    return managementUsers.map((m) => ({
      id: m.user.id,
      firstname: m.user.firstname,
      lastname: m.user.lastname,
      email: m.user.email,
      role: m.user.role,
      manageType: m.manageType,
    }));
  } catch (error) {
    throw new AppError('Failed to fetch management by type', 500);
  }
};
