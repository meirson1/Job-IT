/*
  Warnings:

  - You are about to drop the column `url` on the `Job` table. All the data in the column will be lost.
  - Changed the type of `externalId` on the `Job` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Job_source_url_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "url",
DROP COLUMN "externalId",
ADD COLUMN     "externalId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalId_key" ON "Job"("externalId");
