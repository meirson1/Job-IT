/*
  Warnings:

  - Made the column `requirements` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `responsibilities` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workplaceType` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `employmentType` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experienceLevel` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "requirements" SET NOT NULL,
ALTER COLUMN "responsibilities" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "workplaceType" SET NOT NULL,
ALTER COLUMN "employmentType" SET NOT NULL,
ALTER COLUMN "experienceLevel" SET NOT NULL;
