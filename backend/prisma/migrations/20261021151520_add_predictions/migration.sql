-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PredictionSource" AS ENUM ('MOCK', 'AI_SERVICE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "CropReport" ADD COLUMN     "predictionStatus" "PredictionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "source" "PredictionSource" NOT NULL,
    "modelVersion" TEXT,
    "disease" TEXT,
    "diseaseConfidence" DOUBLE PRECISION,
    "pest" TEXT,
    "pestConfidence" DOUBLE PRECISION,
    "riskLevel" "RiskLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_reportId_key" ON "Prediction"("reportId");

-- CreateIndex
CREATE INDEX "Prediction_riskLevel_idx" ON "Prediction"("riskLevel");

-- CreateIndex
CREATE INDEX "Prediction_disease_idx" ON "Prediction"("disease");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CropReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
