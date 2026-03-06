'use server'

import prisma from "@/lib/db";

export async function cariPegawaiByNik(nikPencarian: string) {
  try {
    const pegawai = await prisma.pegawai.findFirst({
      where: { nik: nikPencarian },
    });

    if (!pegawai) return { success: false, message: "Data Pegawai tidak ditemukan dengan NIK tersebut!" };
    return { success: true, data: pegawai };
  } catch (error) {
    console.error("Error mencari pegawai:", error);
    return { success: false, message: "Terjadi kesalahan pada server saat mencari data." };
  }
}

export async function catatIstirahatSakit(idPegawai: string) {
  try {
    await prisma.presensi.create({
      data: {
        id_pegawai: idPegawai,
        tipe: "sakit",
      }
    });

    return { success: true, message: "Status Istirahat Sakit berhasil dicatat di sistem!" };
  } catch (error) {
    console.error("Error mencatat istirahat sakit:", error);
    return { success: false, message: "Gagal mencatat data ke database." };
  }
}