DROP INDEX "Answer_resultId_blockId_stepId_key";

ALTER TABLE "Answer" 
RENAME COLUMN "stepId" TO "groupId";

ALTER TABLE "PublicSniper"
RENAME COLUMN "blocks" TO "groups";

ALTER TABLE "PublicSniper"
ALTER COLUMN groups TYPE JSONB USING to_json(groups);

ALTER TABLE "PublicSniper"
ALTER COLUMN edges TYPE JSONB USING to_json(edges);

ALTER TABLE "Sniper"
RENAME COLUMN "blocks" TO "groups";

ALTER TABLE "Sniper"
ALTER COLUMN groups TYPE JSONB USING to_json(groups);

ALTER TABLE "Sniper"
ALTER COLUMN edges TYPE JSONB USING to_json(edges);

UPDATE "Sniper" t
SET groups = REPLACE(REPLACE(REPLACE(t.groups::text, '"blockId":', '"groupId":'), '"steps":', '"blocks":'), '"stepId":', '"blockId":')::jsonb,
edges = REPLACE(REPLACE(t.edges::text, '"blockId":', '"groupId":'), '"stepId":', '"blockId":')::jsonb;

UPDATE "PublicSniper" t
SET groups = REPLACE(REPLACE(REPLACE(t.groups::text, '"blockId":', '"groupId":'), '"steps":', '"blocks":'), '"stepId":', '"blockId":')::jsonb,
edges = REPLACE(REPLACE(t.edges::text, '"blockId":', '"groupId":'), '"stepId":', '"blockId":')::jsonb;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_resultId_blockId_groupId_key" ON "Answer"("resultId", "blockId", "groupId");
