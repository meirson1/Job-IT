-- DropIndex
DROP INDEX "Job_source_url_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "url",
DROP COLUMN "externalId",
ADD COLUMN     "externalId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalId_key" ON "Job"("externalId");
