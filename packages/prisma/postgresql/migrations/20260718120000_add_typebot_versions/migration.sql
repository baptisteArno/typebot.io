-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "activeVersionId" TEXT;

-- CreateTable
CREATE TABLE "TypebotVersion" (
    "id" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "typebotId" TEXT NOT NULL,
    "groups" JSONB NOT NULL,
    "events" JSONB,
    "variables" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "settings" JSONB NOT NULL,

    CONSTRAINT "TypebotVersion_pkey" PRIMARY KEY ("id")
);

-- Backfill current published snapshots as version 1.
INSERT INTO "TypebotVersion" (
    "id",
    "versionNumber",
    "version",
    "createdAt",
    "createdById",
    "typebotId",
    "groups",
    "events",
    "variables",
    "edges",
    "theme",
    "settings"
)
SELECT
    'typebot_version_' || "id",
    1,
    "version",
    "updatedAt",
    NULL,
    "typebotId",
    "groups",
    "events",
    "variables",
    "edges",
    "theme",
    "settings"
FROM "PublicTypebot";

UPDATE "PublicTypebot"
SET "activeVersionId" = 'typebot_version_' || "id"
WHERE "activeVersionId" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PublicTypebot_activeVersionId_key" ON "PublicTypebot"("activeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "TypebotVersion_typebotId_versionNumber_key" ON "TypebotVersion"("typebotId", "versionNumber");

-- CreateIndex
CREATE INDEX "TypebotVersion_typebotId_createdAt_idx" ON "TypebotVersion"("typebotId", "createdAt");

-- AddForeignKey
ALTER TABLE "TypebotVersion" ADD CONSTRAINT "TypebotVersion_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicTypebot" ADD CONSTRAINT "PublicTypebot_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "TypebotVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
