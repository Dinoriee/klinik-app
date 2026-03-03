-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'dokter', 'perawat');

-- CreateEnum
CREATE TYPE "TipePresensi" AS ENUM ('sakit', 'hamil', 'laktasi', 'umum');

-- CreateEnum
CREATE TYPE "PresensiMedis" AS ENUM ('hadir', 'izin');

-- CreateEnum
CREATE TYPE "JenisObat" AS ENUM ('tablet', 'kapsul', 'sirup', 'salep', 'injeksi', 'tetes', 'puyer');

-- CreateTable
CREATE TABLE "User" (
    "id_user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Tenaga_Medis" (
    "id_tenaga_medis" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "kode_tenaga_medis" TEXT NOT NULL,
    "nik" INTEGER NOT NULL,
    "nama_tenaga_medis" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,

    CONSTRAINT "Tenaga_Medis_pkey" PRIMARY KEY ("id_tenaga_medis")
);

-- CreateTable
CREATE TABLE "Pegawai" (
    "id_pegawai" TEXT NOT NULL,
    "nomor_pegawai" TEXT NOT NULL,
    "nik" INTEGER NOT NULL,
    "nama_pegawai" TEXT NOT NULL,
    "departemen" TEXT NOT NULL,

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id_pegawai")
);

-- CreateTable
CREATE TABLE "Penyakit" (
    "id_penyakit" TEXT NOT NULL,
    "nama_penyakit" TEXT NOT NULL,

    CONSTRAINT "Penyakit_pkey" PRIMARY KEY ("id_penyakit")
);

-- CreateTable
CREATE TABLE "Permintaan_Obat" (
    "id_permintaan" TEXT NOT NULL,
    "id_pegawai" TEXT NOT NULL,
    "id_tenaga_medis" TEXT NOT NULL,
    "id_penyakit" TEXT NOT NULL,
    "waktu_permintaan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permintaan_Obat_pkey" PRIMARY KEY ("id_permintaan")
);

-- CreateTable
CREATE TABLE "Obat" (
    "id_obat" TEXT NOT NULL,
    "nama_obat" TEXT NOT NULL,
    "nama_batch" TEXT NOT NULL,
    "stok_saat_ini" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "expired_date" TIMESTAMP(3) NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "jenis_obat" "JenisObat" NOT NULL,

    CONSTRAINT "Obat_pkey" PRIMARY KEY ("id_obat")
);

-- CreateTable
CREATE TABLE "Detail_Permintaan_Obat" (
    "id_permintaan" TEXT NOT NULL,
    "id_obat" TEXT NOT NULL,
    "jumlah_diminta" INTEGER NOT NULL,

    CONSTRAINT "Detail_Permintaan_Obat_pkey" PRIMARY KEY ("id_permintaan")
);

-- CreateTable
CREATE TABLE "Presensi" (
    "id_presensi" TEXT NOT NULL,
    "id_pegawai" TEXT NOT NULL,
    "jam_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jam_keluar" TIMESTAMP(3),
    "tipe" "TipePresensi" NOT NULL,

    CONSTRAINT "Presensi_pkey" PRIMARY KEY ("id_presensi")
);

-- CreateTable
CREATE TABLE "Presensi_Tenaga_Medis" (
    "id_presensi" TEXT NOT NULL,
    "id_tenaga_medis" TEXT NOT NULL,
    "jam_masuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jam_keluar" TIMESTAMP(3),
    "keterangan" "PresensiMedis" NOT NULL,

    CONSTRAINT "Presensi_Tenaga_Medis_pkey" PRIMARY KEY ("id_presensi")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id_notifikasi" TEXT NOT NULL,
    "id_obat" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id_notifikasi")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenaga_Medis_id_user_key" ON "Tenaga_Medis"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Tenaga_Medis_nik_key" ON "Tenaga_Medis"("nik");

-- CreateIndex
CREATE INDEX "Tenaga_Medis_id_tenaga_medis_nik_idx" ON "Tenaga_Medis"("id_tenaga_medis", "nik");

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_nomor_pegawai_key" ON "Pegawai"("nomor_pegawai");

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_nik_key" ON "Pegawai"("nik");

-- CreateIndex
CREATE INDEX "Pegawai_id_pegawai_nik_idx" ON "Pegawai"("id_pegawai", "nik");

-- CreateIndex
CREATE INDEX "Permintaan_Obat_id_pegawai_id_tenaga_medis_idx" ON "Permintaan_Obat"("id_pegawai", "id_tenaga_medis");

-- CreateIndex
CREATE INDEX "Presensi_id_pegawai_idx" ON "Presensi"("id_pegawai");

-- CreateIndex
CREATE INDEX "Presensi_jam_masuk_idx" ON "Presensi"("jam_masuk");

-- CreateIndex
CREATE INDEX "Presensi_Tenaga_Medis_id_tenaga_medis_idx" ON "Presensi_Tenaga_Medis"("id_tenaga_medis");

-- CreateIndex
CREATE INDEX "Presensi_Tenaga_Medis_jam_masuk_idx" ON "Presensi_Tenaga_Medis"("jam_masuk");

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
ALTER TABLE "Presensi_Tenaga_Medis" ADD CONSTRAINT "Presensi_Tenaga_Medis_id_tenaga_medis_fkey" FOREIGN KEY ("id_tenaga_medis") REFERENCES "Tenaga_Medis"("id_tenaga_medis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_id_obat_fkey" FOREIGN KEY ("id_obat") REFERENCES "Obat"("id_obat") ON DELETE RESTRICT ON UPDATE CASCADE;
