-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'VALIDATED', 'CORRECTED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateTable
CREATE TABLE "CropReport" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT,
    "growthStage" TEXT NOT NULL,
    "plot" TEXT NOT NULL DEFAULT 'My field',
    "symptoms" TEXT[],
    "notes" TEXT,
    "symptomStart" DATE,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "caseStatus" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CropReport_userId_createdAt_idx" ON "CropReport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CropReport_reviewStatus_idx" ON "CropReport"("reviewStatus");

-- CreateIndex
CREATE INDEX "CropReport_caseStatus_idx" ON "CropReport"("caseStatus");

-- CreateIndex
CREATE INDEX "CropReport_crop_idx" ON "CropReport"("crop");

-- AddForeignKey
ALTER TABLE "CropReport" ADD CONSTRAINT "CropReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
