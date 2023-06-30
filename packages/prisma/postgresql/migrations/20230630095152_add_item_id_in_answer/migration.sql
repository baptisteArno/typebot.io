-- DropIndex
DROP INDEX IF EXISTS "Answer_groupId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Result_typebotId_idx";

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
CREATE INDEX IF NOT EXISTS "Result_typebotId_hasStarted_createdAt_idx" ON "Result"("typebotId", "hasStarted", "createdAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Result_typebotId_isCompleted_idx" ON "Result"("typebotId", "isCompleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Typebot_isArchived_createdAt_idx" ON "Typebot"("isArchived", "createdAt" DESC);