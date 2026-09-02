-- Data backfill before narrowing BookingStatus: every booking used to be born as
-- AWAITING_APPROVAL/APPROVED and could be REJECTED by the owner. That manual-approval step no
-- longer exists — the machine's own listing conditions are the only gate. Existing rows are
-- remapped to the closest equivalent under the new model: APPROVED/AWAITING_APPROVAL (not yet
-- paid) become AWAITING_PAYMENT, REJECTED (owner declined before payment) becomes CANCELLED.
UPDATE "Booking" SET "status" = 'AWAITING_PAYMENT' WHERE "status" IN ('APPROVED', 'AWAITING_APPROVAL');
UPDATE "Booking" SET "status" = 'CANCELLED', "cancellationReason" = COALESCE("cancellationReason", 'Recusado pelo proprietário (migrado do fluxo de aprovação anterior).') WHERE "status" = 'REJECTED';

UPDATE "BookingStatusHistory" SET "previousStatus" = 'AWAITING_PAYMENT' WHERE "previousStatus" IN ('APPROVED', 'AWAITING_APPROVAL');
UPDATE "BookingStatusHistory" SET "nextStatus" = 'AWAITING_PAYMENT' WHERE "nextStatus" IN ('APPROVED', 'AWAITING_APPROVAL');
UPDATE "BookingStatusHistory" SET "previousStatus" = 'CANCELLED' WHERE "previousStatus" = 'REJECTED';
UPDATE "BookingStatusHistory" SET "nextStatus" = 'CANCELLED' WHERE "nextStatus" = 'REJECTED';

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('DRAFT', 'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'TRANSPORT_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'IN_USE', 'AWAITING_RETURN', 'RETURNED', 'COMPLETED', 'CANCELLED', 'IN_DISPUTE');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TABLE "BookingStatusHistory" ALTER COLUMN "previousStatus" TYPE "BookingStatus_new" USING ("previousStatus"::text::"BookingStatus_new");
ALTER TABLE "BookingStatusHistory" ALTER COLUMN "nextStatus" TYPE "BookingStatus_new" USING ("nextStatus"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Machine" DROP COLUMN "instantBooking";
