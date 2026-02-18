-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'dokter', 'perawat');

-- CreateEnum
CREATE TYPE "TipePresensi" AS ENUM ('sakit', 'hamil', 'laktasi', 'umum');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "tenaga_MedisId_tenaga_medis" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Tenaga_Medis" (
    "id_tenaga_medis" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "kode_tenaga_medis" TEXT NOT NULL,
    "nama_tenaga_medis" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,

    CONSTRAINT "Tenaga_Medis_pkey" PRIMARY KEY ("id_tenaga_medis")
);

-- CreateTable
CREATE TABLE "Pegawai" (
    "id_pegawai" SERIAL NOT NULL,
    "nomor_pegawai" TEXT NOT NULL,
    "nama_pegawai" TEXT NOT NULL,
    "departemen" TEXT NOT NULL,

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id_pegawai")
);

-- CreateTable
CREATE TABLE "Penyakit" (
    "id_penyakit" SERIAL NOT NULL,
    "nama_penyakit" TEXT NOT NULL,

    CONSTRAINT "Penyakit_pkey" PRIMARY KEY ("id_penyakit")
);

-- CreateTable
CREATE TABLE "Permintaan_Obat" (
    "id_permintaan" SERIAL NOT NULL,
    "id_pegawai" INTEGER NOT NULL,
    "id_tenaga_medis" INTEGER NOT NULL,
    "id_penyakit" INTEGER NOT NULL,
    "waktu_permintaan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permintaan_Obat_pkey" PRIMARY KEY ("id_permintaan")
);

-- CreateTable
CREATE TABLE "Obat" (
    "id_obat" SERIAL NOT NULL,
    "nama_obat" TEXT NOT NULL,
    "nama_batch" TEXT NOT NULL,
    "stok_saat_ini" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "expired_date" TIMESTAMP(3) NOT NULL,
    "reorder_level" INTEGER NOT NULL,

    CONSTRAINT "Obat_pkey" PRIMARY KEY ("id_obat")
);

-- CreateTable
CREATE TABLE "Detail_Permintaan_Obat" (
    "id_permintaan" INTEGER NOT NULL,
    "id_obat" INTEGER NOT NULL,
    "jumlah_diminta" INTEGER NOT NULL,

    CONSTRAINT "Detail_Permintaan_Obat_pkey" PRIMARY KEY ("id_permintaan","id_obat")
);

-- CreateTable
CREATE TABLE "Presensi" (
    "id_presensi" SERIAL NOT NULL,
    "id_pegawai" INTEGER NOT NULL,
    "jam_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jam_keluar" TIMESTAMP(3),
    "tipe" "TipePresensi" NOT NULL,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id_presensi")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id_notifikasi" SERIAL NOT NULL,
    "id_obat" INTEGER NOT NULL,
    "pesan" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id_notifikasi")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenaga_Medis_id_user_key" ON "Tenaga_Medis"("id_user");

-- AddForeignKey
ALTER TABLE "Tenaga_Medis" ADD CONSTRAINT "Tenaga_Medis_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permintaan_Obat" ADD CONSTRAINT "Permintaan_Obat_id_pegawai_fkey" FOREIGN KEY ("id_pegawai") REFERENCES "Pegawai"("id_pegawai") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permintaan_Obat" ADD CONSTRAINT "Permintaan_Obat_id_tenaga_medis_fkey" FOREIGN KEY ("id_tenaga_medis") REFERENCES "Tenaga_Medis"("id_tenaga_medis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permintaan_Obat" ADD CONSTRAINT "Permintaan_Obat_id_penyakit_fkey" FOREIGN KEY ("id_penyakit") REFERENCES "Penyakit"("id_penyakit") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail_Permintaan_Obat" ADD CONSTRAINT "Detail_Permintaan_Obat_id_permintaan_fkey" FOREIGN KEY ("id_permintaan") REFERENCES "Permintaan_Obat"("id_permintaan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail_Permintaan_Obat" ADD CONSTRAINT "Detail_Permintaan_Obat_id_obat_fkey" FOREIGN KEY ("id_obat") REFERENCES "Obat"("id_obat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presensi" ADD CONSTRAINT "Presensi_id_pegawai_fkey" FOREIGN KEY ("id_pegawai") REFERENCES "Pegawai"("id_pegawai") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_id_obat_fkey" FOREIGN KEY ("id_obat") REFERENCES "Obat"("id_obat") ON DELETE RESTRICT ON UPDATE CASCADE;
