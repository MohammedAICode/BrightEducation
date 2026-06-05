-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
ADD COLUMN     "timeFormat" TEXT NOT NULL DEFAULT '12h';
