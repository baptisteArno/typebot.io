-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('READ', 'WRITE');

-- CreateTable
CREATE TABLE "Invitation" (
    "email" TEXT NOT NULL,
    "sniperId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL
);

-- CreateTable
CREATE TABLE "CollaboratorsOnSnipers" (
    "userId" TEXT NOT NULL,
    "sniperId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_sniperId_key" ON "Invitation"("email", "sniperId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorsOnSnipers_userId_sniperId_key" ON "CollaboratorsOnSnipers"("userId", "sniperId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_sniperId_fkey" FOREIGN KEY ("sniperId") REFERENCES "Sniper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorsOnSnipers" ADD CONSTRAINT "CollaboratorsOnSnipers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorsOnSnipers" ADD CONSTRAINT "CollaboratorsOnSnipers_sniperId_fkey" FOREIGN KEY ("sniperId") REFERENCES "Sniper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
