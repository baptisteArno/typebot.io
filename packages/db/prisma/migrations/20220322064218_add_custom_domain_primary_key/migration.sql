-- DropIndex
DROP INDEX "CustomDomain_name_key";

-- AlterTable
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("name");
