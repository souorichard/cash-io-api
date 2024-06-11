/*
  Warnings:

  - You are about to drop the column `categorty` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "categorty",
ADD COLUMN     "category" TEXT NOT NULL;
