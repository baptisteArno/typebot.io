-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_typebotId_fkey";

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "isArchived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
