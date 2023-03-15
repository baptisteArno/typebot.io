BEGIN;
UPDATE "Workspace" SET "plan" = 'PRO' WHERE "plan" = 'TEAM';
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'STARTER', 'PRO', 'LIFETIME', 'OFFERED');
ALTER TABLE "Workspace" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Workspace" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "Plan_old";
ALTER TABLE "Workspace" ALTER COLUMN "plan" SET DEFAULT 'FREE';
UPDATE "Workspace" SET "plan" = 'STARTER' WHERE "plan" = 'PRO';
COMMIT;

ALTER TABLE "Workspace" ADD COLUMN     "additionalChatsIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "additionalStorageIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "chatsLimitFirstEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "chatsLimitSecondEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "storageLimitFirstEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "storageLimitSecondEmailSentAt" TIMESTAMP(3);