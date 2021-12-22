/*
  Warnings:

  - You are about to drop the column `steps` on the `PublicTypebot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PublicTypebot" DROP COLUMN "steps";

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "answers" JSONB[],
ADD COLUMN     "isCompleted" BOOLEAN;
