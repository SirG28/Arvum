-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dataDeletionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
