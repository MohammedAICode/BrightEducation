/*
  Warnings:

  - You are about to drop the column `firstName` on the `Management` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Management` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Teacher` table. All the data in the column will be lost.
  - Added the required column `joiningDate` to the `Management` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manageType` to the `Management` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joiningDate` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionDate` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joiningDate` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualification` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContact` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContactRelation` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ENROLLMENT_STATUS" AS ENUM ('ACTIVE', 'PROMOTED', 'RETAINED', 'DROPPED_OUT');

-- CreateEnum
CREATE TYPE "MANAGE_TYPE" AS ENUM ('ACCOUNTS', 'CLASS_TEACHER', 'INCHARGE');

-- CreateEnum
CREATE TYPE "TENURE_STATUS" AS ENUM ('ACTIVE', 'TRANSFERRED', 'RESIGNED', 'RETIRED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Management" DROP CONSTRAINT "Management_userId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- AlterTable
ALTER TABLE "Management" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "expInYrs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "joiningDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "manageType" "MANAGE_TYPE" NOT NULL;

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "annualSalary" BIGINT,
ADD COLUMN     "expInYrs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "joiningDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "resignationDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "admissionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "classGrade" TEXT,
ADD COLUMN     "preSchool" TEXT,
ADD COLUMN     "rollNumber" TEXT,
ADD COLUMN     "section" TEXT NOT NULL DEFAULT 'A';

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "annualSalary" BIGINT,
ADD COLUMN     "expInYrs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "joiningDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "qualification" TEXT NOT NULL,
ADD COLUMN     "resignationDate" TIMESTAMP(3),
ADD COLUMN     "subjects" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emergencyContact" TEXT NOT NULL,
ADD COLUMN     "emergencyContactRelation" TEXT NOT NULL,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastname" TEXT,
ADD COLUMN     "nationality" TEXT NOT NULL DEFAULT 'Indian',
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "parentOccupation" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "parentRelation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImg" BYTEA,
ADD COLUMN     "profileImgKey" TEXT,
ADD COLUMN     "religion" TEXT;

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" TEXT NOT NULL,
    "classTenureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTeacherTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "sectionTenureId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "TENURE_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ClassTeacherTenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ClassTenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagementTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "managementId" TEXT NOT NULL,
    "status" "TENURE_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ManagementTenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classTenureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "SectionTenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "status" "TENURE_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "StaffTenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "sectionTenureId" TEXT NOT NULL,
    "rollNumber" TEXT,
    "status" "ENROLLMENT_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectTeacherTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "sectionTenureId" TEXT NOT NULL,
    "classSubjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "TENURE_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "SubjectTeacherTenure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherTenure" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "TENURE_STATUS" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TeacherTenure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_name_key" ON "AcademicYear"("name");

-- CreateIndex
CREATE INDEX "AcademicYear_isActive_idx" ON "AcademicYear"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_classTenureId_name_key" ON "ClassSubject"("classTenureId", "name");

-- CreateIndex
CREATE INDEX "ClassTeacherTenure_academicYearId_teacherId_idx" ON "ClassTeacherTenure"("academicYearId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacherTenure_academicYearId_sectionTenureId_key" ON "ClassTeacherTenure"("academicYearId", "sectionTenureId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacherTenure_sectionTenureId_key" ON "ClassTeacherTenure"("sectionTenureId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTenure_academicYearId_name_key" ON "ClassTenure"("academicYearId", "name");

-- CreateIndex
CREATE INDEX "ManagementTenure_academicYearId_status_idx" ON "ManagementTenure"("academicYearId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementTenure_managementId_academicYearId_key" ON "ManagementTenure"("managementId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "SectionTenure_academicYearId_classTenureId_name_key" ON "SectionTenure"("academicYearId", "classTenureId", "name");

-- CreateIndex
CREATE INDEX "StaffTenure_academicYearId_status_idx" ON "StaffTenure"("academicYearId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StaffTenure_staffId_academicYearId_key" ON "StaffTenure"("staffId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicYearId_status_idx" ON "StudentEnrollment"("academicYearId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYearId_key" ON "StudentEnrollment"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "SubjectTeacherTenure_academicYearId_teacherId_idx" ON "SubjectTeacherTenure"("academicYearId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTeacherTenure_academicYearId_sectionTenureId_classSu_key" ON "SubjectTeacherTenure"("academicYearId", "sectionTenureId", "classSubjectId");

-- CreateIndex
CREATE INDEX "TeacherTenure_academicYearId_status_idx" ON "TeacherTenure"("academicYearId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherTenure_teacherId_academicYearId_key" ON "TeacherTenure"("teacherId", "academicYearId");

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classTenureId_fkey" FOREIGN KEY ("classTenureId") REFERENCES "ClassTenure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherTenure" ADD CONSTRAINT "ClassTeacherTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherTenure" ADD CONSTRAINT "ClassTeacherTenure_sectionTenureId_fkey" FOREIGN KEY ("sectionTenureId") REFERENCES "SectionTenure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacherTenure" ADD CONSTRAINT "ClassTeacherTenure_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTenure" ADD CONSTRAINT "ClassTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Management" ADD CONSTRAINT "Management_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementTenure" ADD CONSTRAINT "ManagementTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementTenure" ADD CONSTRAINT "ManagementTenure_managementId_fkey" FOREIGN KEY ("managementId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionTenure" ADD CONSTRAINT "SectionTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionTenure" ADD CONSTRAINT "SectionTenure_classTenureId_fkey" FOREIGN KEY ("classTenureId") REFERENCES "ClassTenure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTenure" ADD CONSTRAINT "StaffTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTenure" ADD CONSTRAINT "StaffTenure_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_sectionTenureId_fkey" FOREIGN KEY ("sectionTenureId") REFERENCES "SectionTenure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacherTenure" ADD CONSTRAINT "SubjectTeacherTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacherTenure" ADD CONSTRAINT "SubjectTeacherTenure_sectionTenureId_fkey" FOREIGN KEY ("sectionTenureId") REFERENCES "SectionTenure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacherTenure" ADD CONSTRAINT "SubjectTeacherTenure_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacherTenure" ADD CONSTRAINT "SubjectTeacherTenure_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTenure" ADD CONSTRAINT "TeacherTenure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTenure" ADD CONSTRAINT "TeacherTenure_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
