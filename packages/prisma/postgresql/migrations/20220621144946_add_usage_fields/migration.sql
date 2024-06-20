/*
  Warnings:

  - Made the column `groups` on table `PublicSniper` required. This step will fail if there are existing NULL values in that column.
  - Made the column `edges` on table `PublicSniper` required. This step will fail if there are existing NULL values in that column.
  - Made the column `groups` on table `Sniper` required. This step will fail if there are existing NULL values in that column.
  - Made the column `edges` on table `Sniper` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "storageUsed" INTEGER;

-- AlterTable
ALTER TABLE "PublicSniper" ALTER COLUMN "groups" SET NOT NULL,
ALTER COLUMN "edges" SET NOT NULL;

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "hasStarted" BOOLEAN;

-- AlterTable
ALTER TABLE "Sniper" ALTER COLUMN "groups" SET NOT NULL,
ALTER COLUMN "edges" SET NOT NULL;
