/*
  Warnings:

  - You are about to drop the column `available` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "available",
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 1;
