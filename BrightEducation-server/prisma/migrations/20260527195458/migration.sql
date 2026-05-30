/*
  Warnings:

  - You are about to drop the column `preSchool` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "preSchool",
ADD COLUMN     "prevSchool" TEXT;
