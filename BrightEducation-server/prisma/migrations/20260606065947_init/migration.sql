/*
  Warnings:

  - Added the required column `monthIndex` to the `FeePayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeePayment" ADD COLUMN     "acceptedBy" TEXT,
ADD COLUMN     "monthIndex" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "FeePayment_status_idx" ON "FeePayment"("status");
