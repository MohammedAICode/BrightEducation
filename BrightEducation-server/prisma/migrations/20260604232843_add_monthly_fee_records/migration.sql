-- CreateTable
CREATE TABLE "MonthlyFeeRecord" (
    "id" TEXT NOT NULL,
    "studentFeeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "receivedBy" TEXT,
    "receiptNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFeeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyFeeRecord_studentFeeId_idx" ON "MonthlyFeeRecord"("studentFeeId");

-- CreateIndex
CREATE INDEX "MonthlyFeeRecord_dueDate_idx" ON "MonthlyFeeRecord"("dueDate");

-- CreateIndex
CREATE INDEX "MonthlyFeeRecord_status_idx" ON "MonthlyFeeRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFeeRecord_studentFeeId_month_key" ON "MonthlyFeeRecord"("studentFeeId", "month");

-- AddForeignKey
ALTER TABLE "MonthlyFeeRecord" ADD CONSTRAINT "MonthlyFeeRecord_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "StudentFee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
