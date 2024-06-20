-- DropIndex
DROP INDEX "PublicSniper_customDomain_key";

-- DropIndex
DROP INDEX "PublicSniper_publicId_key";

-- AlterTable
ALTER TABLE "PublicSniper" DROP COLUMN "customDomain",
DROP COLUMN "name",
DROP COLUMN "publicId";
