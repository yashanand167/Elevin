-- AlterTable
ALTER TABLE "Health" ADD COLUMN     "targetCalories" INTEGER,
ADD COLUMN     "targetHeartRate" INTEGER,
ADD COLUMN     "targetMood" TEXT,
ADD COLUMN     "targetSleepHours" DOUBLE PRECISION,
ADD COLUMN     "targetSteps" INTEGER,
ADD COLUMN     "targetWeight" DOUBLE PRECISION;
