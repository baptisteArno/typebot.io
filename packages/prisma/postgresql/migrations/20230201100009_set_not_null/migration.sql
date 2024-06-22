set statement_timeout to 300000;

-- AlterTable
UPDATE "PublicSniper" SET "variables" = '[]' WHERE "variables" IS NULL; 
ALTER TABLE "PublicSniper" ALTER COLUMN "variables" SET NOT NULL;

-- AlterTable
UPDATE "Result" SET "variables" = '[]' WHERE "variables" IS NULL; 
ALTER TABLE "Result" ALTER COLUMN "variables" SET NOT NULL;

-- AlterTable
UPDATE "Sniper" SET "variables" = '[]' WHERE "variables" IS NULL; 
ALTER TABLE "Sniper" ALTER COLUMN "variables" SET NOT NULL;

-- AlterTable
UPDATE "User" SET "onboardingCategories" = '[]' WHERE "onboardingCategories" IS NULL; 
ALTER TABLE "User" ALTER COLUMN "onboardingCategories" SET NOT NULL;

-- AlterTable
UPDATE "Webhook" SET "queryParams" = '[]'  WHERE "queryParams" IS NULL;
UPDATE "Webhook" SET "headers" = '[]'  WHERE "headers" IS NULL; 
ALTER TABLE "Webhook" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "queryParams" SET NOT NULL,
ALTER COLUMN "headers" SET NOT NULL;