-- AlterTable
ALTER TABLE "ClaimableCustomPlan" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "isYearly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vatType" TEXT,
ADD COLUMN     "vatValue" TEXT;
