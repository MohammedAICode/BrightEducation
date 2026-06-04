-- AlterTable
ALTER TABLE "StudentFee" ADD COLUMN     "annualFee" DECIMAL(10,2),
ADD COLUMN     "discountPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "examFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "includeInMonthlyCalculation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "miscellaneousFee" DECIMAL(10,2) DEFAULT 0;
