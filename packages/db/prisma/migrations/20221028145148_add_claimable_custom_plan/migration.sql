-- AlterEnum
ALTER TYPE "Plan" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "customChatsLimit" INTEGER,
ADD COLUMN     "customSeatsLimit" INTEGER,
ADD COLUMN     "customStorageLimit" INTEGER;

-- CreateTable
CREATE TABLE "ClaimableCustomPlan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "chatsLimit" INTEGER NOT NULL,
    "storageLimit" INTEGER NOT NULL,
    "seatsLimit" INTEGER NOT NULL,

    CONSTRAINT "ClaimableCustomPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimableCustomPlan_workspaceId_key" ON "ClaimableCustomPlan"("workspaceId");

-- AddForeignKey
ALTER TABLE "ClaimableCustomPlan" ADD CONSTRAINT "ClaimableCustomPlan_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
