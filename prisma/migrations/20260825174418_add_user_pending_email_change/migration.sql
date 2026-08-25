-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingEmail" TEXT,
ADD COLUMN     "pendingEmailExpiresAt" TIMESTAMP(3),
ADD COLUMN     "pendingEmailToken" TEXT;
