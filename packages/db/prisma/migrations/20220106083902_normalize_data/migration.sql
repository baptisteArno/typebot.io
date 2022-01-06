/*
  Warnings:

  - You are about to drop the column `startBlock` on the `PublicTypebot` table. All the data in the column will be lost.
  - You are about to drop the column `startBlock` on the `Typebot` table. All the data in the column will be lost.
  - Added the required column `steps` to the `PublicTypebot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `blocks` on the `PublicTypebot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `steps` to the `Typebot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `blocks` on the `Typebot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PublicTypebot" DROP COLUMN "startBlock",
ADD COLUMN     "steps" JSONB NOT NULL,
DROP COLUMN "blocks",
ADD COLUMN     "blocks" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Typebot" DROP COLUMN "startBlock",
ADD COLUMN     "steps" JSONB NOT NULL,
DROP COLUMN "blocks",
ADD COLUMN     "blocks" JSONB NOT NULL;
