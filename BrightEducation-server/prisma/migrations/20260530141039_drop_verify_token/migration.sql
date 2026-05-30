/*
  Warnings:

  - You are about to drop the `VerifyToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerifyToken" DROP CONSTRAINT "VerifyToken_userId_fkey";

-- DropTable
DROP TABLE "VerifyToken";

-- DropEnum
DROP TYPE "TokenType";
