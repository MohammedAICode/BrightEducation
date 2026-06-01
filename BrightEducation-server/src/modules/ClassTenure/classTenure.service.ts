import { PrismaClient } from '../../../generated/prisma/client';
import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createClassTenure = async (data: { academicYearId: string; name: string }) => {
  try {
    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // Check if class with same name already exists in this academic year
    const existingClass = await prisma.classTenure.findUnique({
      where: {
        academicYearId_name: {
          academicYearId: data.academicYearId,
          name: data.name,
        },
      },
    });

    if (existingClass) {
      throw new AppError('Class with this name already exists in this academic year', 400);
    }

    const classTenure = await prisma.classTenure.create({
      data,
      include: {
        academicYear: true,
      },
    });

    return classTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create class tenure', 500);
  }
};

export const getAllClassTenures = async (academicYearId?: string) => {
  try {
    const where = academicYearId ? { academicYearId } : {};
    
    const classTenures = await prisma.classTenure.findMany({
      where,
      include: {
        academicYear: true,
        sectionTenures: true,
        classSubjects: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return classTenures;
  } catch (error) {
    throw new AppError('Failed to fetch class tenures', 500);
  }
};

export const getClassTenureById = async (id: string) => {
  try {
    const classTenure = await prisma.classTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        sectionTenures: true,
        classSubjects: true,
      },
    });

    if (!classTenure) {
      throw new AppError('Class tenure not found', 404);
    }

    return classTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch class tenure', 500);
  }
};

export const updateClassTenure = async (id: string, data: { name?: string }) => {
  try {
    const existingClass = await prisma.classTenure.findUnique({
      where: { id },
    });

    if (!existingClass) {
      throw new AppError('Class tenure not found', 404);
    }

    // If updating name, check for uniqueness
    if (data.name && data.name !== existingClass.name) {
      const duplicateClass = await prisma.classTenure.findUnique({
        where: {
          academicYearId_name: {
            academicYearId: existingClass.academicYearId,
            name: data.name,
          },
        },
      });

      if (duplicateClass) {
        throw new AppError('Class with this name already exists in this academic year', 400);
      }
    }

    const updatedClass = await prisma.classTenure.update({
      where: { id },
      data,
      include: {
        academicYear: true,
      },
    });

    return updatedClass;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update class tenure', 500);
  }
};

export const deleteClassTenure = async (id: string) => {
  try {
    const classTenure = await prisma.classTenure.findUnique({
      where: { id },
      include: {
        sectionTenures: true,
        classSubjects: true,
      },
    });

    if (!classTenure) {
      throw new AppError('Class tenure not found', 404);
    }

    // Check if class has sections or subjects
    if (classTenure.sectionTenures.length > 0 || classTenure.classSubjects.length > 0) {
      throw new AppError('Cannot delete class tenure with existing sections or subjects', 400);
    }

    await prisma.classTenure.delete({
      where: { id },
    });

    return { message: 'Class tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete class tenure', 500);
  }
};
