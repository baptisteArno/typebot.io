-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN "tenant" TEXT,
ADD COLUMN "toolDescription" TEXT;

-- AlterTable
ALTER TABLE "TypebotHistory" ADD COLUMN "tenant" TEXT,
ADD COLUMN "toolDescription" TEXT;
