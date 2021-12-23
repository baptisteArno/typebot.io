/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `PublicTypebot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `Typebot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PublicTypebot_publicId_key" ON "PublicTypebot"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Typebot_publicId_key" ON "Typebot"("publicId");
