-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "variableId" TEXT;

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "prefilledVariables" JSONB[];
