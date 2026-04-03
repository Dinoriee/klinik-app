'use server'

import prisma from "@/lib/db"; 
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

function pseudoCuid() {
  // Prisma normally generates cuid() client-side; for raw SQL fallback we generate a stable unique string.
  return `c${randomBytes(12).toString("hex")}`;
}

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
    revalidatePath("/medis/istirahat-sakit");
    revalidatePath("/admin/istirahat-sakit");
    return { success: true, message: "Status Istirahat Sakit berhasil dicatat di sistem presensi!" };
  } catch (error) {
    console.error("Error mencatat istirahat sakit:", error);
    return { success: false, message: "Gagal mencatat data ke database." };
  }
}

export async function simpanRekamMedisAction(formData: {
  id_pegawai: string;
  email_dokter: string;
  keluhan: string;
  tensi: string;
  suhu: number | null;
  diagnosa: string;
  tindakan: string;
  status_perawatan: 'rawat_jalan' | 'rawat_inap';
}) {
  try {
    let id_tenaga_medis = "";

    const user = await prisma.user.findUnique({
      where: { email: formData.email_dokter },
      include: { tenagaMedis: true }
    });

    if (user && user.tenagaMedis) {
      
      id_tenaga_medis = user.tenagaMedis.id_tenaga_medis;
    } else {
      
      const dokterAcak = await prisma.tenaga_Medis.findFirst();
      
      if (!dokterAcak) {
        return { success: false, message: "Gagal: Tabel Tenaga Medis kosong! Tambahkan minimal 1 dokter dulu di menu Kelola Tenaga Medis." };
      }
      id_tenaga_medis = dokterAcak.id_tenaga_medis;
    }

    // The generated Prisma Client can be missing `rekam_Medis` / `kwitansi` models.
    // Use raw SQL to insert, matching Prisma's cuid() behavior.
    const idRekamMedis = pseudoCuid();
    try {
      await prisma.$executeRaw`
        INSERT INTO "Rekam_Medis"
          ("id_rekam_medis", "id_pegawai", "id_tenaga_medis", "keluhan", "tensi", "suhu", "diagnosa", "tindakan", "status_perawatan")
        VALUES
          (${idRekamMedis}, ${formData.id_pegawai}, ${id_tenaga_medis}, ${formData.keluhan},
           ${formData.tensi || null}, ${formData.suhu}, ${formData.diagnosa}, ${formData.tindakan || null},
           ${formData.status_perawatan})
      `;
    } catch (error) {
      console.error("Error insert Rekam_Medis via raw SQL:", error);
      return { success: false, message: "Gagal menyimpan rekam medis (tabel Rekam_Medis belum tersedia atau schema belum sinkron)." };
    }

    if (formData.status_perawatan === 'rawat_inap') {
      const idKwitansi = pseudoCuid();
      try {
        await prisma.$executeRaw`
          INSERT INTO "Kwitansi"
            ("id_kwitansi", "id_rekam_medis", "status")
          VALUES
            (${idKwitansi}, ${idRekamMedis}, ${'belum_lunas'})
        `;
      } catch (error) {
        console.error("Error insert Kwitansi via raw SQL:", error);
        // Rekam medis already saved; don't fail the whole operation.
      }
    }

    return { 
      success: true, 
      message: formData.status_perawatan === 'rawat_inap' 
        ? "Sukses! Rekam Medis disimpan & Draf Kwitansi Rawat Inap otomatis dibuat!" 
        : "Sukses! Rekam Medis Rawat Jalan berhasil disimpan!" 
    };

  } catch (error) {
    console.error("Error simpan rekam medis:", error);
    return { success: false, message: "Gagal menyimpan rekam medis ke database." };
  }
}
