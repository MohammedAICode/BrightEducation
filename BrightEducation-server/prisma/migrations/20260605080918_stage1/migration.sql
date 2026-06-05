/*
  Warnings:

  - You are about to drop the column `receiptNumber` on the `FeePayment` table. All the data in the column will be lost.
  - You are about to drop the column `receivedBy` on the `FeePayment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `FeePayment` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to drop the column `amount` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentId` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `isPaused` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `pauseReason` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `periodEnd` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleId` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `StudentFee` table. All the data in the column will be lost.
  - You are about to drop the column `dateFormat` on the `SystemSettings` table. All the data in the column will be lost.
  - You are about to drop the column `timeFormat` on the `SystemSettings` table. All the data in the column will be lost.
  - You are about to drop the `FeeSchedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `month` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `paymentMethod` on the `FeePayment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `balanceAmount` to the `StudentFee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyAmount` to the `StudentFee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `StudentFee` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `feeType` on the `StudentFee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "FeeSchedule" DROP CONSTRAINT "FeeSchedule_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "StudentFee" DROP CONSTRAINT "StudentFee_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentFee" DROP CONSTRAINT "StudentFee_scheduleId_fkey";

-- DropIndex
DROP INDEX "FeePayment_paymentDate_idx";

-- DropIndex
DROP INDEX "FeePayment_receiptNumber_idx";

-- DropIndex
DROP INDEX "FeePayment_receiptNumber_key";

-- DropIndex
DROP INDEX "StudentFee_enrollmentId_idx";

-- DropIndex
DROP INDEX "StudentFee_periodStart_idx";

-- DropIndex
DROP INDEX "StudentFee_status_idx";

-- AlterTable
ALTER TABLE "FeePayment" DROP COLUMN "receiptNumber",
DROP COLUMN "receivedBy",
ADD COLUMN     "month" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "paymentDate" DROP DEFAULT,
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentFee" DROP COLUMN "amount",
DROP COLUMN "enrollmentId",
DROP COLUMN "isPaused",
DROP COLUMN "pauseReason",
DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
DROP COLUMN "scheduleId",
DROP COLUMN "status",
ADD COLUMN     "annualFee" DECIMAL(10,2),
ADD COLUMN     "balanceAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "discountPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "examFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "includeInMonthlyCalculation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "miscellaneousFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "monthlyAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL,
DROP COLUMN "feeType",
ADD COLUMN     "feeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SystemSettings" DROP COLUMN "dateFormat",
DROP COLUMN "timeFormat";

-- DropTable
DROP TABLE "FeeSchedule";

-- DropEnum
DROP TYPE "FeeStatus";

-- DropEnum
DROP TYPE "FeeType";

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateIndex
CREATE INDEX "FeePayment_month_idx" ON "FeePayment"("month");

-- CreateIndex
CREATE INDEX "StudentFee_feeType_idx" ON "StudentFee"("feeType");
