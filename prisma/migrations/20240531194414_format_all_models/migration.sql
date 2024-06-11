/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `categorty` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'REVENUE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "categorty" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "type" "TransactionType" NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "phone" INTEGER NOT NULL;
