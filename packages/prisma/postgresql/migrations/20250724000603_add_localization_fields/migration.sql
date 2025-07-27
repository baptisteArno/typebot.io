-- AlterTable
ALTER TABLE "Typebot" ADD COLUMN     "defaultLocale" CHAR(10) NOT NULL DEFAULT 'en',
ADD COLUMN     "supportedLocales" JSONB NOT NULL DEFAULT '["en"]',
ADD COLUMN     "localeDetectionConfig" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "PublicTypebot" ADD COLUMN     "defaultLocale" CHAR(10) NOT NULL DEFAULT 'en',
ADD COLUMN     "supportedLocales" JSONB NOT NULL DEFAULT '["en"]',
ADD COLUMN     "localeDetectionConfig" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX "Typebot_defaultLocale_idx" ON "Typebot"("defaultLocale");

-- CreateIndex
CREATE INDEX "PublicTypebot_defaultLocale_idx" ON "PublicTypebot"("defaultLocale");