import { AcademicYear, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../config/Error/AppError";
import { HTTP_STATUS } from "../../config/Error/ErrorConstant";

export async function createAcademicYear(
  data: Prisma.AcademicYearCreateInput,
): Promise<AcademicYear> {
  // Check if academic year with same name already exists
  const existingYear = await prisma.academicYear.findUnique({
    where: { name: data.name },
  });

  if (existingYear) {
    throw new AppError(
      `Academic year with name '${data.name}' already exists`,
      HTTP_STATUS.CONFLICT,
    );
  }

  // If creating as active, deactivate all other academic years
  if (data.isActive) {
    await prisma.academicYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  return await prisma.academicYear.create({
    data,
  });
}

export async function getAllAcademicYears(): Promise<AcademicYear[]> {
  return await prisma.academicYear.findMany({
    orderBy: { startDate: 'desc' },
  });
}

export async function getAcademicYearById(
  id: string,
): Promise<AcademicYear | null> {
  return await prisma.academicYear.findUnique({
    where: { id },
  });
}

export async function getActiveAcademicYear(): Promise<AcademicYear | null> {
  return await prisma.academicYear.findFirst({
    where: { isActive: true },
  });
}

export async function updateAcademicYear(
  id: string,
  data: Prisma.AcademicYearUpdateInput,
): Promise<AcademicYear> {
  // Check if academic year exists
  const existingYear = await prisma.academicYear.findUnique({
    where: { id },
  });

  if (!existingYear) {
    throw new AppError(
      "Academic year not found",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  // If updating name, check for uniqueness
  if (data.name && data.name !== existingYear.name) {
    const nameExists = await prisma.academicYear.findUnique({
      where: { name: data.name as string },
    });

    if (nameExists) {
      throw new AppError(
        `Academic year with name '${data.name}' already exists`,
        HTTP_STATUS.CONFLICT,
      );
    }
  }

  // If activating, deactivate all other academic years
  if (data.isActive === true && !existingYear.isActive) {
    await prisma.academicYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  return await prisma.academicYear.update({
    where: { id },
    data,
  });
}

export async function activateAcademicYear(
  id: string,
): Promise<AcademicYear> {
  // Check if academic year exists
  const existingYear = await prisma.academicYear.findUnique({
    where: { id },
  });

  if (!existingYear) {
    throw new AppError(
      "Academic year not found",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  // Deactivate all other academic years
  await prisma.academicYear.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Activate the specified academic year
  return await prisma.academicYear.update({
    where: { id },
    data: { isActive: true },
  });
}

export async function deactivateAcademicYear(
  id: string,
): Promise<AcademicYear> {
  // Check if academic year exists
  const existingYear = await prisma.academicYear.findUnique({
    where: { id },
  });

  if (!existingYear) {
    throw new AppError(
      "Academic year not found",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return await prisma.academicYear.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function deleteAcademicYear(
  id: string,
): Promise<AcademicYear> {
  // Check if academic year exists
  const existingYear = await prisma.academicYear.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          classTenures: true,
          studentEnrollments: true,
          teacherTenures: true,
          staffTenures: true,
          managementTenures: true,
        },
      },
    },
  });

  if (!existingYear) {
    throw new AppError(
      "Academic year not found",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  // Check if academic year has any associated data
  const hasData =
    existingYear._count.classTenures > 0 ||
    existingYear._count.studentEnrollments > 0 ||
    existingYear._count.teacherTenures > 0 ||
    existingYear._count.staffTenures > 0 ||
    existingYear._count.managementTenures > 0;

  if (hasData) {
    throw new AppError(
      "Cannot delete academic year with associated data. Please delete all classes, enrollments, and tenures first.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return await prisma.academicYear.delete({
    where: { id },
  });
}
