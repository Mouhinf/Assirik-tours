DO $migration$
BEGIN
  CREATE TYPE "RequestStatus" AS ENUM ('NOUVEAU', 'EN_COURS', 'TRAITE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$migration$;

ALTER TABLE "Reservation"
  ADD COLUMN IF NOT EXISTS "processingStatus" "RequestStatus" NOT NULL DEFAULT 'NOUVEAU';

CREATE INDEX IF NOT EXISTS "Reservation_processingStatus_idx"
  ON "Reservation"("processingStatus");
