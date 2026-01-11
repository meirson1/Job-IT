/*
  Warnings:

  - The values [HIRED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `role` on the `CompanyMember` table. All the data in the column will be lost.
  - You are about to drop the column `applyUrl` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `easyApply` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `postedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `companyRole` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[source,url]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'INTERVIEW', 'REJECTED', 'CLOSED');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
ALTER TYPE "GlobalRole" ADD VALUE 'RECRUITER';

-- DropIndex
DROP INDEX "Job_source_externalId_key";

-- DropIndex
DROP INDEX "Job_source_idx";

-- AlterTable
ALTER TABLE "CompanyMember" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "applyUrl",
DROP COLUMN "easyApply",
DROP COLUMN "externalId",
DROP COLUMN "postedAt",
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyRole";

-- DropEnum
DROP TYPE "CompanyRole";

-- CreateIndex
CREATE UNIQUE INDEX "Job_source_url_key" ON "Job"("source", "url");
