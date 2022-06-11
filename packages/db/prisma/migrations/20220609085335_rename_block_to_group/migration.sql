DROP INDEX "Answer_resultId_blockId_stepId_key";

ALTER TABLE "Answer" 
RENAME COLUMN "stepId" TO "groupId";

ALTER TABLE "PublicTypebot"
RENAME COLUMN "blocks" TO "groups";

ALTER TABLE "PublicTypebot"
ALTER COLUMN groups TYPE JSONB USING to_json(groups);

ALTER TABLE "PublicTypebot"
ALTER COLUMN edges TYPE JSONB USING to_json(edges);

ALTER TABLE "Typebot"
RENAME COLUMN "blocks" TO "groups";

ALTER TABLE "Typebot"
ALTER COLUMN groups TYPE JSONB USING to_json(groups);

ALTER TABLE "Typebot"
ALTER COLUMN edges TYPE JSONB USING to_json(edges);

UPDATE "Typebot" t
SET groups = REPLACE(REPLACE(REPLACE(t.groups::text, '"blockId":', '"groupId":'), '"steps":', '"blocks":'), '"stepId":', '"blockId":')::jsonb,
edges = REPLACE(REPLACE(t.edges::text, '"blockId":', '"groupId":'), '"stepId":', '"blockId":')::jsonb;

UPDATE "PublicTypebot" t
SET groups = REPLACE(REPLACE(REPLACE(t.groups::text, '"blockId":', '"groupId":'), '"steps":', '"blocks":'), '"stepId":', '"blockId":')::jsonb,
edges = REPLACE(REPLACE(t.edges::text, '"blockId":', '"groupId":'), '"stepId":', '"blockId":')::jsonb;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_resultId_blockId_groupId_key" ON "Answer"("resultId", "blockId", "groupId");
