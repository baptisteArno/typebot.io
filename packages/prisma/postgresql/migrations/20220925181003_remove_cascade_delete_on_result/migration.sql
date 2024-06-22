-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_sniperId_fkey";

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sniperId_fkey" FOREIGN KEY ("sniperId") REFERENCES "Sniper"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
