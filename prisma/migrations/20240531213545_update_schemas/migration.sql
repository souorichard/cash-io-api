/*
  Warnings:

  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" SET DEFAULT 'Pessoal';

-- DropTable
DROP TABLE "Invite";

-- DropTable
DROP TABLE "TeamMember";

-- DropEnum
DROP TYPE "Role";
