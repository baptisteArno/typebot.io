-- AlterTable: Rename expiresAt to accessTokenExpiresAt and add refreshTokenExpiresAt
ALTER TABLE "Account" RENAME COLUMN "expiresAt" TO "accessTokenExpiresAt";
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP;
