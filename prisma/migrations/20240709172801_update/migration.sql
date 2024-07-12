/*
  Warnings:

  - You are about to drop the column `phone` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "phone",
ALTER COLUMN "name" DROP NOT NULL;
