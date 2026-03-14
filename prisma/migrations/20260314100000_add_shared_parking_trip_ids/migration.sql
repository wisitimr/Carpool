-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "sharedParkingTripIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
