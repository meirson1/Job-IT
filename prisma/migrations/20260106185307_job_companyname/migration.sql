/*
  Warnings:

  - You are about to drop the column `companyId` on the `Job` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropIndex
DROP INDEX "Application_userId_jobId_key";

-- DropIndex
DROP INDEX "Application_userId_jobId_status_idx";

-- DropIndex
DROP INDEX "Job_companyId_idx";

-- DropIndex
DROP INDEX "User_companyId_idx";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "companyId",
ADD COLUMN     "companyName" TEXT NOT NULL;
