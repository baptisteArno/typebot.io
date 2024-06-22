/*
  Warnings:

  - A unique constraint covering the columns `[customDomain]` on the table `PublicSniper` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customDomain]` on the table `Sniper` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PublicSniper" ADD COLUMN     "customDomain" TEXT;

-- AlterTable
ALTER TABLE "Sniper" ADD COLUMN     "customDomain" TEXT;

-- CreateTable
CREATE TABLE "CustomDomain" (
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_name_key" ON "CustomDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSniper_customDomain_key" ON "PublicSniper"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Sniper_customDomain_key" ON "Sniper"("customDomain");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
