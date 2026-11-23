-- Services no longer have a price, but can have a description
ALTER TABLE "Service" DROP COLUMN "priceSek",
ADD COLUMN     "description" TEXT;

-- Every time now belongs to a service.
-- The column is added as optional first, so existing times can be filled in.
ALTER TABLE "TimeSlot" ADD COLUMN     "serviceId" INTEGER;

-- Times created before services existed get a general "Appointment" service,
-- so no times or bookings are lost. Nothing happens if there are no old times.
INSERT INTO "Service" ("name", "durationMinutes")
SELECT 'Appointment', 60
WHERE EXISTS (SELECT 1 FROM "TimeSlot" WHERE "serviceId" IS NULL);

UPDATE "TimeSlot"
SET "serviceId" = (SELECT MAX("id") FROM "Service" WHERE "name" = 'Appointment')
WHERE "serviceId" IS NULL;

-- Now every time has a service, so the column can be required
ALTER TABLE "TimeSlot" ALTER COLUMN "serviceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "TimeSlot_serviceId_idx" ON "TimeSlot"("serviceId");

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
