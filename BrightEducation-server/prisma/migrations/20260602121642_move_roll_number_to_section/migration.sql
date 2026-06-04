/*
  Warnings:

  - You are about to drop the column `rollNoCounter` on the `ClassTenure` table. All the data in the column will be lost.
  - You are about to drop the column `rollNoPrefix` on the `ClassTenure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassTenure" DROP COLUMN "rollNoCounter",
DROP COLUMN "rollNoPrefix";

-- AlterTable
ALTER TABLE "SectionTenure" ADD COLUMN     "rollNoCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rollNoPrefix" TEXT;
