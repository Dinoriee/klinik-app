-- CreateEnum
CREATE TYPE "StatusPerawatan" AS ENUM ('rawat_jalan', 'rawat_inap');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('belum_lunas', 'lunas');

-- CreateTable
CREATE TABLE "Rekam_Medis" (
    "id_rekam_medis" TEXT NOT NULL,
    "id_pegawai" TEXT NOT NULL,
    "id_tenaga_medis" TEXT NOT NULL,
    "keluhan" TEXT NOT NULL,
    "tensi" TEXT,
    "suhu" DOUBLE PRECISION,
    "diagnosa" TEXT NOT NULL,
    "tindakan" TEXT,
    "status_perawatan" "StatusPerawatan" NOT NULL DEFAULT 'rawat_jalan',
    "tanggal_periksa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rekam_Medis_pkey" PRIMARY KEY ("id_rekam_medis")
);

-- CreateTable
CREATE TABLE "Kwitansi" (
    "id_kwitansi" TEXT NOT NULL,
    "id_rekam_medis" TEXT NOT NULL,
    "total_biaya" DOUBLE PRECISION,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'belum_lunas',
    "tanggal_terbit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_lunas" TIMESTAMP(3),

    CONSTRAINT "Kwitansi_pkey" PRIMARY KEY ("id_kwitansi")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kwitansi_id_rekam_medis_key" ON "Kwitansi"("id_rekam_medis");

-- AddForeignKey
ALTER TABLE "Rekam_Medis" ADD CONSTRAINT "Rekam_Medis_id_pegawai_fkey" FOREIGN KEY ("id_pegawai") REFERENCES "Pegawai"("id_pegawai") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekam_Medis" ADD CONSTRAINT "Rekam_Medis_id_tenaga_medis_fkey" FOREIGN KEY ("id_tenaga_medis") REFERENCES "Tenaga_Medis"("id_tenaga_medis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kwitansi" ADD CONSTRAINT "Kwitansi_id_rekam_medis_fkey" FOREIGN KEY ("id_rekam_medis") REFERENCES "Rekam_Medis"("id_rekam_medis") ON DELETE CASCADE ON UPDATE CASCADE;
