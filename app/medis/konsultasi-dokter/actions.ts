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

    const rekamMedis = await prisma.rekam_Medis.create({
      data: {
        id_pegawai: formData.id_pegawai,
        id_tenaga_medis: id_tenaga_medis,
        keluhan: formData.keluhan,
        tensi: formData.tensi || null,
        suhu: formData.suhu,
        diagnosa: formData.diagnosa,
        tindakan: formData.tindakan || null,
        status_perawatan: formData.status_perawatan,
      }
    });

    if (formData.status_perawatan === 'rawat_inap') {
      await prisma.kwitansi.create({
        data: {
          id_rekam_medis: rekamMedis.id_rekam_medis,
          status: 'belum_lunas',
        }
      });
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