-- DropIndex
DROP INDEX IF EXISTS "Answer_groupId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Result_sniperId_idx";

-- AlterTable
ALTER TABLE
  "Answer"
ADD
  COLUMN "itemId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Answer_blockId_itemId_idx" ON "Answer"("blockId", "itemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Answer_storageUsed_idx" ON "Answer"("storageUsed");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Result_sniperId_hasStarted_createdAt_idx" ON "Result"("sniperId", "hasStarted", "createdAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Result_sniperId_isCompleted_idx" ON "Result"("sniperId", "isCompleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Sniper_isArchived_createdAt_idx" ON "Sniper"("isArchived", "createdAt" DESC);