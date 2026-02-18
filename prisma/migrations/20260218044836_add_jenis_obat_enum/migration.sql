/*
  Warnings:

  - Added the required column `jenis_obat` to the `Obat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JenisObat" AS ENUM ('tablet', 'kapsul', 'sirup', 'salep', 'injeksi', 'tetes', 'puyer');

-- AlterTable
ALTER TABLE "Obat" ADD COLUMN     "jenis_obat" "JenisObat" NOT NULL;
