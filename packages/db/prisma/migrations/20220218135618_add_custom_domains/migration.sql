/*
  Warnings:

  - A unique constraint covering the columns `[customDomain]` on the table `PublicTypebot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customDomain]` on the table `Typebot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "customDomain" TEXT;

-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "customDomain" TEXT;

-- CreateTable
CREATE TABLE "CustomDomain" (
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_name_key" ON "CustomDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PublicTypebot_customDomain_key" ON "PublicTypebot"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Typebot_customDomain_key" ON "Typebot"("customDomain");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
