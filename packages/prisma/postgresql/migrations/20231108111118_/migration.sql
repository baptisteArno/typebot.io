-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "events" JSONB;

-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "events" JSONB;

-- CreateTable
CREATE TABLE "VisitedEdge" (
    "resultId" TEXT NOT NULL,
    "edgeId" TEXT NOT NULL,
    "index" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VisitedEdge_resultId_index_key" ON "VisitedEdge"("resultId", "index");

-- AddForeignKey
ALTER TABLE "VisitedEdge" ADD CONSTRAINT "VisitedEdge_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
