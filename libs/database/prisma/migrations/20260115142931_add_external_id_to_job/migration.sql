-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "externalId" TEXT NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalId_key" ON "Job"("externalId");
