-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "method" TEXT NOT NULL,
    "queryParams" JSONB[],
    "headers" JSONB[],
    "body" TEXT,
    "sniperId" TEXT NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_sniperId_fkey" FOREIGN KEY ("sniperId") REFERENCES "Sniper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
