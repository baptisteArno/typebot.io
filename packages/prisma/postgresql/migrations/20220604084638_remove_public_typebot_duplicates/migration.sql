-- DropIndex
DROP INDEX "PublicTypebot_customDomain_key";

-- DropIndex
DROP INDEX "PublicTypebot_publicId_key";

-- AlterTable
ALTER TABLE "PublicTypebot" DROP COLUMN "customDomain",
DROP COLUMN "name",
DROP COLUMN "publicId";
