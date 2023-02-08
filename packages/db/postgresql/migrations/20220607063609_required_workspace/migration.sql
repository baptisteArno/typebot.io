/*
  Warnings:

  - Made the column `workspaceId` on table `Credentials` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspaceId` on table `CustomDomain` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspaceId` on table `DashboardFolder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspaceId` on table `Typebot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Credentials" ALTER COLUMN "workspaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CustomDomain" ALTER COLUMN "workspaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DashboardFolder" ALTER COLUMN "workspaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Typebot" ALTER COLUMN "workspaceId" SET NOT NULL;
