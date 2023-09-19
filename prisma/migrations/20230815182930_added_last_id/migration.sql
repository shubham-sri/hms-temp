-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "lastAppointmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_lastAppointmentId_fkey" FOREIGN KEY ("lastAppointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
