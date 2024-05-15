/*
  Warnings:

  - You are about to drop the column `itemId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `storageUsed` on the `Answer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Answer_blockId_itemId_idx";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "itemId",
DROP COLUMN "storageUsed";

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

-- CreateTable
CREATE TABLE "AnswerV2" (
    "id" SERIAL NOT NULL,
    "blockId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,

    CONSTRAINT "AnswerV2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SetVariableHistoryItem_resultId_index_key" ON "SetVariableHistoryItem"("resultId", "index");

-- CreateIndex
CREATE INDEX "AnswerV2_blockId_idx" ON "AnswerV2"("blockId");

-- AddForeignKey
ALTER TABLE "SetVariableHistoryItem" ADD CONSTRAINT "SetVariableHistoryItem_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerV2" ADD CONSTRAINT "AnswerV2_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
