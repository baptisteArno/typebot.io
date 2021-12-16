/*
  Warnings:

  - Added the required column `startBlock` to the `PublicTypebot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startBlock` to the `Typebot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "blocks" JSONB[],
ADD COLUMN     "startBlock" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "blocks" JSONB[],
ADD COLUMN     "startBlock" JSONB NOT NULL;
