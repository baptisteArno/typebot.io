-- DropIndex
DROP INDEX "Result_createdAt_typebotId_idx";

-- DropIndex
DROP INDEX "Result_typebotId_createdAt_idx";

-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "spaceId" TEXT;

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Space_id_workspaceId_key" ON "Space"("id", "workspaceId");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Typebot" ADD CONSTRAINT "Typebot_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;
