-- AlterTable
ALTER TABLE "StudentFee" ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "StudentFee_createdById_idx" ON "StudentFee"("createdById");

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
