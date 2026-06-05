/*
  Warnings:

  - You are about to drop the column `month` on the `FeePayment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `FeePayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - The `paymentMethod` column on the `FeePayment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `annualFee` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `balanceAmount` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercentage` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `examFee` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `includeInMonthlyCalculation` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `labFee` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `miscellaneousFee` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyAmount` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `StudentFee` table. All the data in the column will be lost.
  - The `feeType` column on the `StudentFee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[receiptNumber]` on the table `FeePayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiptNumber` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedBy` to the `FeePayment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('TUITION', 'SCHOOL');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED', 'PAUSED');

-- DropIndex
DROP INDEX "FeePayment_month_idx";

-- AlterTable
ALTER TABLE "FeePayment" DROP COLUMN "month",
ADD COLUMN     "receiptNumber" TEXT NOT NULL,
ADD COLUMN     "receivedBy" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "paymentDate" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "StudentFee" DROP COLUMN "annualFee",
DROP COLUMN "balanceAmount",
DROP COLUMN "discountPercentage",
DROP COLUMN "examFee",
DROP COLUMN "includeInMonthlyCalculation",
DROP COLUMN "labFee",
DROP COLUMN "miscellaneousFee",
DROP COLUMN "monthlyAmount",
DROP COLUMN "paidAmount",
DROP COLUMN "paymentStatus",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "enrollmentId" TEXT,
ADD COLUMN     "isPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pauseReason" TEXT,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3),
ADD COLUMN     "scheduleId" TEXT,
ADD COLUMN     "status" "FeeStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "feeType",
ADD COLUMN     "feeType" "FeeType" NOT NULL DEFAULT 'TUITION';

-- CreateTable
CREATE TABLE "FeeSchedule" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "feeType" "FeeType" NOT NULL DEFAULT 'TUITION',
    "monthlyAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeSchedule_academicYearId_idx" ON "FeeSchedule"("academicYearId");

-- CreateIndex
CREATE INDEX "FeeSchedule_feeType_idx" ON "FeeSchedule"("feeType");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_receiptNumber_key" ON "FeePayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "FeePayment_receiptNumber_idx" ON "FeePayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "FeePayment_paymentDate_idx" ON "FeePayment"("paymentDate");

-- CreateIndex
CREATE INDEX "StudentFee_enrollmentId_idx" ON "StudentFee"("enrollmentId");

-- CreateIndex
CREATE INDEX "StudentFee_feeType_idx" ON "StudentFee"("feeType");

-- CreateIndex
CREATE INDEX "StudentFee_status_idx" ON "StudentFee"("status");

-- CreateIndex
CREATE INDEX "StudentFee_periodStart_idx" ON "StudentFee"("periodStart");

-- AddForeignKey
ALTER TABLE "FeeSchedule" ADD CONSTRAINT "FeeSchedule_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "FeeSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
