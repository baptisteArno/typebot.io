-- Update old answers
UPDATE "Answer"
SET "blockId" = "Answer"."groupId",
  "groupId" = "Answer"."blockId"
WHERE "createdAt" < '2022-06-10 22:00:00 UTC'