-- CreateEnum
CREATE TYPE "TypebotHistoryOrigin" AS ENUM ('PUBLISH', 'DUPLICATION', 'MANUAL', 'IMPORT', 'RESTORE');

-- CreateTable
CREATE TABLE "TypebotHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typebotId" TEXT NOT NULL,
    "version" TEXT,
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "origin" "TypebotHistoryOrigin" NOT NULL,
    "isRestored" BOOLEAN NOT NULL DEFAULT false,
    "restoredFromId" TEXT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "folderId" TEXT,
    "groups" JSONB NOT NULL,
    "events" JSONB,
    "variables" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "selectedThemeTemplateId" TEXT,
    "settings" JSONB NOT NULL,
    "resultsTablePreferences" JSONB,
    "publicId" TEXT,
    "customDomain" TEXT,
    "workspaceId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL,
    "isClosed" BOOLEAN NOT NULL,
    "riskLevel" INTEGER,
    "whatsAppCredentialsId" TEXT,
    "snapshotChecksum" VARCHAR(64) NOT NULL,

    CONSTRAINT "TypebotHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TypebotHistory_typebotId_createdAt_idx" ON "TypebotHistory"("typebotId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "TypebotHistory_origin_createdAt_idx" ON "TypebotHistory"("origin", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "TypebotHistory_authorId_createdAt_idx" ON "TypebotHistory"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "TypebotHistory_restoredFromId_idx" ON "TypebotHistory"("restoredFromId");

-- CreateIndex
CREATE UNIQUE INDEX "TypebotHistory_typebotId_snapshotChecksum_key" ON "TypebotHistory"("typebotId", "snapshotChecksum");

-- AddForeignKey
ALTER TABLE "TypebotHistory" ADD CONSTRAINT "TypebotHistory_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypebotHistory" ADD CONSTRAINT "TypebotHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypebotHistory" ADD CONSTRAINT "TypebotHistory_restoredFromId_fkey" FOREIGN KEY ("restoredFromId") REFERENCES "TypebotHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
