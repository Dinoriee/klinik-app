-- CreateEnum
CREATE TYPE "PresensiMedis" AS ENUM ('hadir', 'izin');

-- CreateTable
CREATE TABLE "Presensi_Tenaga_Medis" (
    "id_presensi" SERIAL NOT NULL,
    "id_tenaga_medis" INTEGER NOT NULL,
    "jam_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jam_keluar" TIMESTAMP(3),
    "keterangan" "PresensiMedis" NOT NULL,

    CONSTRAINT "Presensi_Tenaga_Medis_pkey" PRIMARY KEY ("id_presensi")
);

-- AddForeignKey
ALTER TABLE "Presensi_Tenaga_Medis" ADD CONSTRAINT "Presensi_Tenaga_Medis_id_tenaga_medis_fkey" FOREIGN KEY ("id_tenaga_medis") REFERENCES "Tenaga_Medis"("id_tenaga_medis") ON DELETE RESTRICT ON UPDATE CASCADE;
