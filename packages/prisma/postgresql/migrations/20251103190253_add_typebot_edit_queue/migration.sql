-- AlterTable
ALTER TABLE "TypebotHistory" ALTER COLUMN "isSecondaryFlow" DROP DEFAULT;

-- CreateTable
CREATE TABLE "TypebotEditQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typebotId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypebotEditQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TypebotEditQueue_typebotId_idx" ON "TypebotEditQueue"("typebotId");

-- CreateIndex
CREATE UNIQUE INDEX "TypebotEditQueue_userId_typebotId_key" ON "TypebotEditQueue"("userId", "typebotId");

-- AddForeignKey
ALTER TABLE "TypebotEditQueue" ADD CONSTRAINT "TypebotEditQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypebotEditQueue" ADD CONSTRAINT "TypebotEditQueue_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
