-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "operationSupportIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "operationSupportValueInCents" INTEGER NOT NULL DEFAULT 0;
