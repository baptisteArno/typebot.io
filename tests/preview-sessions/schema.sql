-- ChatSession from packages/prisma/postgresql/schema.prisma; no other tables needed.
CREATE TABLE "ChatSession" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "state" JSONB NOT NULL,
  "isReplying" BOOLEAN
);
