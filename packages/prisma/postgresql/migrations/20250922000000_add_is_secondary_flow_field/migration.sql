-- Add isSecondaryFlow field to Typebot model
ALTER TABLE "Typebot" ADD COLUMN "isSecondaryFlow" BOOLEAN NOT NULL DEFAULT false;

-- Add isSecondaryFlow field to PublicTypebot model
ALTER TABLE "PublicTypebot" ADD COLUMN "isSecondaryFlow" BOOLEAN NOT NULL DEFAULT false;

-- Add isSecondaryFlow field to TypebotHistory model
ALTER TABLE "TypebotHistory" ADD COLUMN "isSecondaryFlow" BOOLEAN NOT NULL DEFAULT false;
