import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createSectionTenure = async (data: { academicYearId: string; classTenureId: string; name: string; capacity: number }) => {
  try {
    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // Check if class tenure exists
    const classTenure = await prisma.classTenure.findUnique({
      where: { id: data.classTenureId },
    });

    if (!classTenure) {
      throw new AppError('Class tenure not found', 404);
    }

    // Check if class tenure belongs to the same academic year
    if (classTenure.academicYearId !== data.academicYearId) {
      throw new AppError('Class tenure does not belong to the specified academic year', 400);
    }

    // Check if section with same name already exists in this class and academic year
    const existingSection = await prisma.sectionTenure.findUnique({
      where: {
        academicYearId_classTenureId_name: {
          academicYearId: data.academicYearId,
          classTenureId: data.classTenureId,
          name: data.name,
        },
      },
    });

    if (existingSection) {
      throw new AppError('Section with this name already exists in this class', 400);
    }

    const sectionTenure = await prisma.sectionTenure.create({
      data,
      include: {
        academicYear: true,
        classTenure: true,
      },
    });

    return sectionTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create section tenure', 500);
  }
};

export const getAllSectionTenures = async (academicYearId?: string, classTenureId?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (classTenureId) where.classTenureId = classTenureId;
    
    const sectionTenures = await prisma.sectionTenure.findMany({
      where,
      include: {
        academicYear: true,
        classTenure: true,
        studentEnrollments: true,
        subjectTeacherTenures: true,
        classTeacherTenure: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return sectionTenures;
  } catch (error) {
    throw new AppError('Failed to fetch section tenures', 500);
  }
};

export const getSectionTenureById = async (id: string) => {
  try {
    const sectionTenure = await prisma.sectionTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        classTenure: true,
        studentEnrollments: true,
        subjectTeacherTenures: true,
        classTeacherTenure: true,
      },
    });

    if (!sectionTenure) {
      throw new AppError('Section tenure not found', 404);
    }

    return sectionTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch section tenure', 500);
  }
};

export const updateSectionTenure = async (id: string, data: { name?: string; capacity?: number }) => {
  try {
    const existingSection = await prisma.sectionTenure.findUnique({
      where: { id },
    });

    if (!existingSection) {
      throw new AppError('Section tenure not found', 404);
    }

    // If updating name, check for uniqueness
    if (data.name && data.name !== existingSection.name) {
      const duplicateSection = await prisma.sectionTenure.findUnique({
        where: {
          academicYearId_classTenureId_name: {
            academicYearId: existingSection.academicYearId,
            classTenureId: existingSection.classTenureId,
            name: data.name,
          },
        },
      });

      if (duplicateSection) {
        throw new AppError('Section with this name already exists in this class', 400);
      }
    }

    // If updating capacity, check if current enrollment exceeds new capacity
    if (data.capacity !== undefined) {
      const currentEnrollment = await prisma.studentEnrollment.count({
        where: { sectionTenureId: id },
      });

      if (currentEnrollment > data.capacity) {
        throw new AppError(`Cannot reduce capacity below current enrollment (${currentEnrollment} students)`, 400);
      }
    }

    const updatedSection = await prisma.sectionTenure.update({
      where: { id },
      data,
      include: {
        academicYear: true,
        classTenure: true,
      },
    });

    return updatedSection;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update section tenure', 500);
  }
};

export const deleteSectionTenure = async (id: string) => {
  try {
    const sectionTenure = await prisma.sectionTenure.findUnique({
      where: { id },
      include: {
        studentEnrollments: true,
        subjectTeacherTenures: true,
        classTeacherTenure: true,
      },
    });

    if (!sectionTenure) {
      throw new AppError('Section tenure not found', 404);
    }

    // Check if section has enrolled students, subject teachers, or class teacher
    if (sectionTenure.studentEnrollments.length > 0 || 
        sectionTenure.subjectTeacherTenures.length > 0 || 
        sectionTenure.classTeacherTenure) {
      throw new AppError('Cannot delete section tenure with existing students or teachers', 400);
    }

    await prisma.sectionTenure.delete({
      where: { id },
    });

    return { message: 'Section tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete section tenure', 500);
  }
};
