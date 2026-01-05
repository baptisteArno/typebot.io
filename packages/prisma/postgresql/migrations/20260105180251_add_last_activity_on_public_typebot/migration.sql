-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "lastActivityAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PublicTypebot_lastActivityAt_idx" ON "PublicTypebot"("lastActivityAt");
