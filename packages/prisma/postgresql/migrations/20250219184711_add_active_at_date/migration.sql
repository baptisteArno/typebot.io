-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "inactiveFirstEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "inactiveSecondEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "lastActivityAt" TIMESTAMP(3);
