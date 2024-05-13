/*
  Warnings:

  - You are about to drop the column `itemId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `storageUsed` on the `Answer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Answer_blockId_itemId_idx";

-- DropIndex
DROP INDEX "Answer_resultId_blockId_groupId_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "itemId",
DROP COLUMN "storageUsed",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Answer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "lastChatSessionId" TEXT;

-- CreateTable
CREATE TABLE "SetVariableHistoryItem" (
    "resultId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "variableId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "value" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SetVariableHistoryItem_resultId_index_key" ON "SetVariableHistoryItem"("resultId", "index");

-- CreateIndex
CREATE INDEX "Answer_blockId_idx" ON "Answer"("blockId");

-- AddForeignKey
ALTER TABLE "SetVariableHistoryItem" ADD CONSTRAINT "SetVariableHistoryItem_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
