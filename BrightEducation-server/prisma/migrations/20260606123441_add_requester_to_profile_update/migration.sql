/*
  Warnings:

  - You are about to drop the column `classCount` on the `AcademicYear` table. All the data in the column will be lost.
  - You are about to drop the column `sectionCount` on the `AcademicYear` table. All the data in the column will be lost.
  - You are about to drop the column `studentCount` on the `AcademicYear` table. All the data in the column will be lost.
  - You are about to drop the column `teacherCount` on the `AcademicYear` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AcademicYear" DROP COLUMN "classCount",
DROP COLUMN "sectionCount",
DROP COLUMN "studentCount",
DROP COLUMN "teacherCount";

-- AlterTable
ALTER TABLE "ProfileUpdateRequest" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "requesterId" TEXT;

-- CreateIndex
CREATE INDEX "ProfileUpdateRequest_requesterId_idx" ON "ProfileUpdateRequest"("requesterId");

-- AddForeignKey
ALTER TABLE "ProfileUpdateRequest" ADD CONSTRAINT "ProfileUpdateRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
