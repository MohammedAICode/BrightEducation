/*
  Warnings:

  - You are about to drop the `MonthlyFeeRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MonthlyFeeRecord" DROP CONSTRAINT "MonthlyFeeRecord_studentFeeId_fkey";

-- DropTable
DROP TABLE "MonthlyFeeRecord";
