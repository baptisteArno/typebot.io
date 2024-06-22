-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_sniperId_fkey";

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "isArchived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Sniper" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sniperId_fkey" FOREIGN KEY ("sniperId") REFERENCES "Sniper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
