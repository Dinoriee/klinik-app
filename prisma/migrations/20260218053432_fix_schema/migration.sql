/*
  Warnings:

  - You are about to drop the column `tenaga_MedisId_tenaga_medis` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nomor_pegawai]` on the table `Pegawai` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tenaga_MedisId_tenaga_medis";

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_nomor_pegawai_key" ON "Pegawai"("nomor_pegawai");
