-- CreateEnum
CREATE TYPE "GraphNavigation" AS ENUM ('MOUSE', 'TRACKPAD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "graphNavigation" "GraphNavigation";
