/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Credentials` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `CustomDomain` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `DashboardFolder` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Typebot` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Credentials" DROP CONSTRAINT "Credentials_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomDomain" DROP CONSTRAINT "CustomDomain_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "DashboardFolder" DROP CONSTRAINT "DashboardFolder_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Typebot" DROP CONSTRAINT "Typebot_ownerId_fkey";

-- DropIndex
DROP INDEX "Credentials_name_type_ownerId_key";

-- DropIndex
DROP INDEX "DashboardFolder_id_ownerId_key";

-- DropIndex
DROP INDEX "Typebot_id_ownerId_key";

-- DropIndex
DROP INDEX "User_stripeId_key";

-- AlterTable
ALTER TABLE "Credentials" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "CustomDomain" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "DashboardFolder" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Typebot" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan",
DROP COLUMN "stripeId";
