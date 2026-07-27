-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "MachineCondition" AS ENUM ('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_MAINTENANCE');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'UNAVAILABLE', 'PAUSED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MachineAvailabilityType" AS ENUM ('MANUAL_BLOCK', 'BOOKING_HOLD', 'BOOKING_CONFIRMED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'TRANSPORT_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'IN_USE', 'AWAITING_RETURN', 'RETURNED', 'COMPLETED', 'CANCELLED', 'IN_DISPUTE');

-- CreateEnum
CREATE TYPE "LogisticsMode" AS ENUM ('RENTER_PICKUP', 'OWNER_DELIVERY', 'PARTNER_TRANSPORT');

-- CreateEnum
CREATE TYPE "LogisticsQuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REFUSED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'REPORTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accessNotes" TEXT,
    "roadType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MachineCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "manufactureYear" INTEGER,
    "description" TEXT NOT NULL,
    "purpose" TEXT,
    "recommendedCrops" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "condition" "MachineCondition" NOT NULL,
    "weight" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "requiresOperator" BOOLEAN NOT NULL DEFAULT false,
    "dailyPriceInCents" INTEGER NOT NULL,
    "hourlyPriceInCents" INTEGER,
    "minimumPriceInCents" INTEGER,
    "depositInCents" INTEGER,
    "minimumRentalDays" INTEGER NOT NULL DEFAULT 1,
    "maximumRentalDays" INTEGER,
    "instantBooking" BOOLEAN NOT NULL DEFAULT false,
    "deliveryRadiusKm" DOUBLE PRECISION,
    "status" "MachineStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineImage" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MachineImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineAvailability" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "MachineAvailabilityType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MachineAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "destinationPropertyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'DRAFT',
    "rentalValueInCents" INTEGER NOT NULL,
    "logisticsValueInCents" INTEGER NOT NULL,
    "serviceFeeInCents" INTEGER NOT NULL,
    "depositInCents" INTEGER NOT NULL,
    "discountInCents" INTEGER NOT NULL DEFAULT 0,
    "totalValueInCents" INTEGER NOT NULL,
    "logisticsMode" "LogisticsMode" NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingStatusHistory" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "previousStatus" "BookingStatus",
    "nextStatus" "BookingStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsQuote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "originPropertyId" TEXT NOT NULL,
    "destinationPropertyId" TEXT NOT NULL,
    "mode" "LogisticsMode" NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "durationMinutes" INTEGER,
    "baseFeeInCents" INTEGER NOT NULL,
    "pricePerKmInCents" INTEGER NOT NULL,
    "equipmentFactor" DOUBLE PRECISION NOT NULL,
    "totalInCents" INTEGER NOT NULL,
    "status" "LogisticsQuoteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogisticsQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'simulado',
    "externalReference" TEXT,
    "amountInCents" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "machineConditionRating" INTEGER,
    "communicationRating" INTEGER,
    "punctualityRating" INTEGER,
    "logisticsRating" INTEGER,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_documentNumber_key" ON "User"("documentNumber");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Property_city_state_idx" ON "Property"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "MachineCategory_slug_key" ON "MachineCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_slug_key" ON "Machine"("slug");

-- CreateIndex
CREATE INDEX "Machine_ownerId_idx" ON "Machine"("ownerId");

-- CreateIndex
CREATE INDEX "Machine_categoryId_idx" ON "Machine"("categoryId");

-- CreateIndex
CREATE INDEX "Machine_status_idx" ON "Machine"("status");

-- CreateIndex
CREATE INDEX "MachineImage_machineId_idx" ON "MachineImage"("machineId");

-- CreateIndex
CREATE INDEX "MachineAvailability_machineId_startDate_endDate_idx" ON "MachineAvailability"("machineId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Booking_machineId_startDate_endDate_idx" ON "Booking"("machineId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Booking_renterId_idx" ON "Booking"("renterId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "BookingStatusHistory_bookingId_idx" ON "BookingStatusHistory"("bookingId");

-- CreateIndex
CREATE INDEX "LogisticsQuote_bookingId_idx" ON "LogisticsQuote"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Review_machineId_idx" ON "Review"("machineId");

-- CreateIndex
CREATE INDEX "Review_targetUserId_idx" ON "Review"("targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_authorId_key" ON "Review"("bookingId", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_machineId_key" ON "Favorite"("userId", "machineId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MachineCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineImage" ADD CONSTRAINT "MachineImage_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineAvailability" ADD CONSTRAINT "MachineAvailability_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_destinationPropertyId_fkey" FOREIGN KEY ("destinationPropertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsQuote" ADD CONSTRAINT "LogisticsQuote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
