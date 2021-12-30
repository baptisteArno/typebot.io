/*
  Warnings:

  - You are about to drop the column `answers` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Result" DROP COLUMN "answers";

-- CreateTable
CREATE TABLE "Answer" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "content" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Answer_resultId_blockId_stepId_key" ON "Answer"("resultId", "blockId", "stepId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
