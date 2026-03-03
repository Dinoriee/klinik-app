import 'dotenv/config'
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({
    adapter,
})

async function main() {
  const hashedPassword = await hash('123', 10)
  console.log('Memulai proses seeding data...');

  // --- SEEDING USER & TENAGA MEDIS (Existing) ---
  await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {},
    create: {
      email: 'admin@mail.com',
      password: hashedPassword,
      role: 'admin',
      name: 'HR PT. xxx'
    },
  });

  await prisma.user.upsert({
    where: { email: 'dokter@mail.com' },
    update: {},
    create: {
      email: 'dokter@mail.com',
      password: hashedPassword,
      role: 'dokter',
      name: 'dr. Dino, Sp.Kom',
      tenagaMedis: {
        create: {
            nik: '1234567890987654',
          kode_tenaga_medis: 'DOC-001',
          nama_tenaga_medis: 'dr. Dino, Sp.Kom',
          jabatan: 'Dokter Spesialis Umum',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'perawat@mail.com' },
    update: {},
    create: {
      email: 'perawat@mail.com',
      password: hashedPassword,
      name: 'Ns. Arif, S.Kep',
      role: 'perawat',
      tenagaMedis: {
        create: {
        nik: '1234567890987655',
          kode_tenaga_medis: 'NS-001',
          nama_tenaga_medis: 'Ns. Arif, S.Kep',
          jabatan: 'Kepala Perawat',
        },
      },
    },
  });

  const hashed_password = await hash('password123', 10);
    console.log('Memulai proses seeding data ke database...');

    // 1. Seeding Tabel User & Tenaga_Medis (20 Data)
    console.log('Menginput data User dan Tenaga Medis...');
    for (let i = 1; i <= 20; i++) {
        const selected_role = i === 1 ? 'admin' : (i % 2 === 0 ? 'dokter' : 'perawat');
        
        await prisma.user.create({
            data: {
                email: `user${i}@klinikapp.com`,
                password: hashed_password,
                name: `Staff Klinik ${i}`,
                role: selected_role as any,
                tenagaMedis: selected_role !== 'admin' ? {
                    create: {
                        nik: (10000 + i).toString(),
                        kode_tenaga_medis: `TM-${i.toString().padStart(3, '0')}`,
                        nama_tenaga_medis: `Tenaga Medis ${i}`,
                        jabatan: selected_role === 'dokter' ? 'Dokter Umum' : 'Perawat Spesialis',
                    }
                } : undefined
            }
        });
    }

    // 2. Seeding Tabel Pegawai (20 Data)
    console.log('Menginput data Pegawai...');
    const departemen_list = ['Produksi', 'Logistik', 'IT', 'HRD', 'Keuangan', 'Operasional'];
    for (let i = 1; i <= 20; i++) {
        await prisma.pegawai.create({
            data: {
                nomor_pegawai: `PEG-${i.toString().padStart(3, '0')}`,
                nik: (20000 + i).toString(),
                nama_pegawai: `Pegawai Perusahaan ${i}`,
                departemen: departemen_list[i % departemen_list.length],
            }
        });
    }

    // 3. Seeding Tabel Penyakit (20 Data)
    console.log('Menginput data Penyakit...');
    const nama_penyakit_list = [
        'Influenza', 'Hipertensi', 'Diabetes Melitus', 'Gastritis', 'Asma Bronkial',
        'Dermatitis', 'Faringitis', 'Cephalgia', 'Anemia', 'Dislipidemia',
        'Common Cold', 'Tonsilitis', 'Arthritis', 'Alergi Makanan', 'Konjungtivitis',
        'Infeksi Saluran Kemih', 'Mialgia', 'Vertigo', 'Bronkhitis', 'Kekurangan Nutrisi'
    ];
    for (const penyakit of nama_penyakit_list) {
        await prisma.penyakit.create({
            data: { nama_penyakit: penyakit }
        });
    }

    // 4. Seeding Tabel Obat (20 Data)
    console.log('Menginput data Obat...');
    const jenis_obat_list = ['tablet', 'kapsul', 'sirup', 'salep', 'injeksi', 'tetes', 'puyer'];
    for (let i = 1; i <= 20; i++) {
        await prisma.obat.create({
            data: {
                nama_obat: `Obat Sampel ${i}`,
                nama_batch: `BATCH-${Math.random().toString(36).substring(7).toUpperCase()}`,
                stok_saat_ini: 50 + i,
                satuan: i % 2 === 0 ? 'Strip' : 'Botol',
                expired_date: new Date('2027-01-01'),
                reorder_level: 10,
                jenis_obat: jenis_obat_list[i % jenis_obat_list.length] as any,
            }
        });
    }

    // Mengambil data yang baru dibuat untuk kebutuhan relasi
    const all_pegawai = await prisma.pegawai.findMany();
    const all_tenaga_medis = await prisma.tenaga_Medis.findMany();
    const all_penyakit = await prisma.penyakit.findMany();
    const all_obat = await prisma.obat.findMany();

    // 5. Seeding Tabel Permintaan_Obat & Detail_Permintaan_Obat (20 Data)
    console.log('Menginput data Permintaan Obat...');
    for (let i = 0; i < 20; i++) {
        await prisma.permintaan_Obat.create({
            data: {
                id_pegawai: all_pegawai[i % all_pegawai.length].id_pegawai,
                id_tenaga_medis: all_tenaga_medis[i % all_tenaga_medis.length].id_tenaga_medis,
                id_penyakit: all_penyakit[i % all_penyakit.length].id_penyakit,
                detail_permintaan: {
                    create: {
                        id_obat: all_obat[i % all_obat.length].id_obat,
                        jumlah_diminta: Math.floor(Math.random() * 5) + 1,
                    }
                }
            }
        });
    }

    // 6. Seeding Tabel Presensi (6 Bulan Terakhir)
    console.log('Menginput data Presensi Pegawai selama 6 bulan terakhir...');
    const tipe_presensi_list = ['umum', 'sakit', 'hamil', 'laktasi'];

    for (let i = 0; i < 6; i++) {
        const target_bulan = new Date();
        target_bulan.setMonth(target_bulan.getMonth() - i);
        const jumlah_kunjungan = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
        
        for (let j = 0; j < jumlah_kunjungan; j++) {
            const random_pegawai = all_pegawai[Math.floor(Math.random() * all_pegawai.length)];
            const tanggal_acak = new Date(target_bulan);
            tanggal_acak.setDate(Math.floor(Math.random() * 28) + 1);
            tanggal_acak.setHours(Math.floor(Math.random() * 6) + 10);
            tanggal_acak.setMinutes(Math.floor(Math.random() * 60));

            await prisma.presensi.create({
                data: {
                    id_pegawai: random_pegawai.id_pegawai,
                    tipe: tipe_presensi_list[Math.floor(Math.random() * tipe_presensi_list.length)] as any,
                    jam_masuk: tanggal_acak,
                    jam_keluar: new Date(tanggal_acak.getTime() + 30 * 60000),
                }
            });
        }
    }

    // 7. Seeding Tabel Presensi_Tenaga_Medis (20 Data)
    console.log('Menginput data Presensi Tenaga Medis...');
    for (let i = 0; i < all_tenaga_medis.length; i++) {
        await prisma.presensi_Tenaga_Medis.create({
            data: {
                id_tenaga_medis: all_tenaga_medis[i].id_tenaga_medis,
                keterangan: 'hadir',
                jam_masuk: new Date(),
            }
        });
    }

    // 8. Seeding Tabel Notifikasi (20 Data)
    console.log('Menginput data Notifikasi...');
    for (let i = 0; i < 20; i++) {
        await prisma.notifikasi.create({
            data: {
                id_obat: all_obat[i % all_obat.length].id_obat,
                pesan: `Peringatan: Stok obat ${all_obat[i % all_obat.length].nama_obat} mendekati batas minimum.`,
                status: 'unread'
            }
        });
    }

    console.log('Seluruh proses seeding telah selesai dilaksanakan.');
}

main()
    .catch((e) => {
        console.error('Terjadi kesalahan selama proses seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });