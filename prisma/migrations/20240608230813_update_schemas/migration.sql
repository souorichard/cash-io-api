/*
  Warnings:

  - You are about to drop the column `teamId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_teamId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "teamId";

-- DropTable
DROP TABLE "Team";
