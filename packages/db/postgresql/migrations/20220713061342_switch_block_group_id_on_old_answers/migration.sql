-- Update old answers
UPDATE "Answer" a
SET "blockId" = a."groupId",
  "groupId" = a."blockId"
WHERE "createdAt" < '2022-06-10 22:00:00 UTC'
  AND NOT EXISTS (
    SELECT 1
    FROM "Answer"
    WHERE "resultId" = a."resultId"
      AND "blockId" = a."groupId"
      AND "groupId" = a."blockId"
  );