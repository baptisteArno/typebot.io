-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0;
