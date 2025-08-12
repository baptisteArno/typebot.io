-- CreateEnum
CREATE TYPE "ChatProvider" AS ENUM ('WHATSAPP', 'DIALOG360');

-- CreateTable
CREATE TABLE "RuntimeMediaIdCache" (
    "provider" "ChatProvider" NOT NULL,
    "url" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "publicTypebotId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "RuntimeMediaIdCache_expiresAt_idx" ON "RuntimeMediaIdCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeMediaIdCache_publicTypebotId_provider_url_key" ON "RuntimeMediaIdCache"("publicTypebotId", "provider", "url");

-- AddForeignKey
ALTER TABLE "RuntimeMediaIdCache" ADD CONSTRAINT "RuntimeMediaIdCache_publicTypebotId_fkey" FOREIGN KEY ("publicTypebotId") REFERENCES "PublicTypebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
