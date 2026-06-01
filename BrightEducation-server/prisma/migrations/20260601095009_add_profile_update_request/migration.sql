-- CreateEnum
CREATE TYPE "REQUEST_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ProfileUpdateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "address" TEXT,
    "emergencyContactRelation" TEXT,
    "emergencyContact" TEXT,
    "bloodGroup" TEXT,
    "nationality" TEXT,
    "religion" TEXT,
    "parentRelation" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "parentOccupation" TEXT,
    "status" "REQUEST_STATUS" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileUpdateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileUpdateRequest_userId_idx" ON "ProfileUpdateRequest"("userId");

-- CreateIndex
CREATE INDEX "ProfileUpdateRequest_status_idx" ON "ProfileUpdateRequest"("status");

-- AddForeignKey
ALTER TABLE "ProfileUpdateRequest" ADD CONSTRAINT "ProfileUpdateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileUpdateRequest" ADD CONSTRAINT "ProfileUpdateRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
