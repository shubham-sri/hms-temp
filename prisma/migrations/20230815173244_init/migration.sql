-- CreateEnum
CREATE TYPE "Tags" AS ENUM ('GOV', 'DM', 'ADM', 'SDM', 'SP', 'PR', 'POL', 'PLI', 'OTH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "tags" "Tags"[],
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "appointmentNo" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateStr" TEXT NOT NULL,
    "isPaymentNeeded" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" SERIAL NOT NULL,
    "isDiabetic" BOOLEAN NOT NULL DEFAULT false,
    "isBP" BOOLEAN NOT NULL DEFAULT false,
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "isOtherDiseases" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vitals_appointmentId_key" ON "vitals"("appointmentId");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
