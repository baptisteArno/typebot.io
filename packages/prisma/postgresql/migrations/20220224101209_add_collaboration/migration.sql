-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('READ', 'WRITE');

-- CreateTable
CREATE TABLE "Invitation" (
    "email" TEXT NOT NULL,
    "typebotId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL
);

-- CreateTable
CREATE TABLE "CollaboratorsOnTypebots" (
    "userId" TEXT NOT NULL,
    "typebotId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_typebotId_key" ON "Invitation"("email", "typebotId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorsOnTypebots_userId_typebotId_key" ON "CollaboratorsOnTypebots"("userId", "typebotId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorsOnTypebots" ADD CONSTRAINT "CollaboratorsOnTypebots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorsOnTypebots" ADD CONSTRAINT "CollaboratorsOnTypebots_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
