-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_typebotId_fkey";

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
