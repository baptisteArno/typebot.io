-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "aiFeatureCredentialId" TEXT,
ADD COLUMN     "aiFeaturePrompt" TEXT,
ADD COLUMN     "inEditorAiFeaturesEnabled" BOOLEAN NOT NULL DEFAULT false;
