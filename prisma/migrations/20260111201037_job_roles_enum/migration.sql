/*
  Warnings:

  - You are about to drop the `JobTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_JobToJobTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "JobRole" AS ENUM ('FULLSTACK', 'FRONTEND', 'BACKEND', 'DATA_ENGINEER', 'DATA_SCIENTIST', 'DEVOPS', 'QA', 'MOBILE', 'PRODUCT', 'SECURITY', 'OTHER');

-- DropForeignKey
ALTER TABLE "_JobToJobTag" DROP CONSTRAINT "_JobToJobTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToJobTag" DROP CONSTRAINT "_JobToJobTag_B_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "role" "JobRole"[];

-- DropTable
DROP TABLE "JobTag";

-- DropTable
DROP TABLE "_JobToJobTag";
