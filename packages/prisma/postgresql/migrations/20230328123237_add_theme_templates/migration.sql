-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "selectedThemeTemplateId" TEXT;

-- CreateTable
CREATE TABLE "ThemeTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "theme" JSONB NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "ThemeTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThemeTemplate" ADD CONSTRAINT "ThemeTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
