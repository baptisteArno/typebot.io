-- CreateTable
CREATE TABLE "BannedIp" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "responsibleTypebotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BannedIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedIp_ip_key" ON "BannedIp"("ip");

-- CreateIndex
CREATE INDEX "Answer_storageUsed_idx" ON "Answer"("storageUsed");

-- AddForeignKey
ALTER TABLE "BannedIp" ADD CONSTRAINT "BannedIp_responsibleTypebotId_fkey" FOREIGN KEY ("responsibleTypebotId") REFERENCES "Typebot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedIp" ADD CONSTRAINT "BannedIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
