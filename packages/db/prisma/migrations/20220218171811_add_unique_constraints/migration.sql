/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,ownerId]` on the table `DashboardFolder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,ownerId]` on the table `Typebot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardFolder_id_ownerId_key" ON "DashboardFolder"("id", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Typebot_id_ownerId_key" ON "Typebot"("id", "ownerId");
