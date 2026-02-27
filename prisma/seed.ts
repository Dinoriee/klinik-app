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
          kode_tenaga_medis: 'DOC-001',
          nama_tenaga_medis: 'dr. Dino, Sp.Kom',
          jabatan: 'Dokter Spesialis Umum',
        },
      },
    },
  });

  // --- SEEDING PEGAWAI ---
  console.log('Seeding data pegawai...');
  const pegawaiData = [
    { nomor_pegawai: 'P-001', nama_pegawai: 'Budi Santoso', departemen: 'Produksi' },
    { nomor_pegawai: 'P-002', nama_pegawai: 'Siti Aminah', departemen: 'Logistik' },
    { nomor_pegawai: 'P-003', nama_pegawai: 'Agus Prayitno', departemen: 'IT' },
    { nomor_pegawai: 'P-004', nama_pegawai: 'Lani Wijaya', departemen: 'HRD' },
    { nomor_pegawai: 'P-005', nama_pegawai: 'Rizky Putra', departemen: 'Produksi' },
  ];

  for (const p of pegawaiData) {
    await prisma.pegawai.upsert({
      where: { nomor_pegawai: p.nomor_pegawai },
      update: {},
      create: p,
    });
  }

  // --- SEEDING PRESENSI (Kunjungan Periksa) ---
  console.log('Seeding data presensi kunjungan (6 bulan terakhir)...');
  const allPegawai = await prisma.pegawai.findMany();
  
  const tipeKunjungan = ['umum', 'sakit', 'laktasi', 'hamil'];
  
  // Buat data random untuk 6 bulan terakhir
  for (let i = 0; i < 6; i++) {
    const targetBulan = new Date();
    targetBulan.setMonth(targetBulan.getMonth() - i);

    // Tiap bulan kita buat 5-10 kunjungan random 🤓
    const jumlahKunjungan = Math.floor(Math.random() * 6) + 5;

    for (let j = 0; j < jumlahKunjungan; j++) {
      const randomPegawai = allPegawai[Math.floor(Math.random() * allPegawai.length)];
      const randomTipe = tipeKunjungan[Math.floor(Math.random() * tipeKunjungan.length)] as any;
      
      // Setting jam masuk random di bulan tersebut
      const jamMasuk = new Date(targetBulan);
      jamMasuk.setDate(Math.floor(Math.random() * 28) + 1);
      jamMasuk.setHours(Math.floor(Math.random() * 8) + 8); // Jam 8 pagi - 4 sore

      await prisma.presensi.create({
        data: {
          id_pegawai: randomPegawai.id_pegawai,
          tipe: randomTipe,
          jam_masuk: jamMasuk,
          jam_keluar: new Date(jamMasuk.getTime() + 30 * 60000), // Selesai periksa 30 menit kemudian 🥀
        }
      });
    }
  }

  // --- SEEDING KHUSUS HARI INI ---
  console.log('Seeding data presensi khusus hari ini...');
  const jumlahKunjunganHariIni = 7; // Mau lu set berapa kunjungan hari ini gng? 🤓

  for (let k = 0; k < jumlahKunjunganHariIni; k++) {
    const randomPegawai = allPegawai[Math.floor(Math.random() * allPegawai.length)];
    const randomTipe = tipeKunjungan[Math.floor(Math.random() * tipeKunjungan.length)] as any;
    
    // Setting jam masuk di berbagai jam hari ini 🥀
    const jamMasukHariIni = new Date();
    // Kita acak dari jam 8 pagi sampe jam sekarang biar natural 🤓
    const jamRandom = Math.floor(Math.random() * (new Date().getHours() - 8 + 1)) + 8;
    jamMasukHariIni.setHours(jamRandom, Math.floor(Math.random() * 60), 0, 0);

    await prisma.presensi.create({
      data: {
        id_pegawai: randomPegawai.id_pegawai,
        tipe: randomTipe,
        jam_masuk: jamMasukHariIni,
        jam_keluar: new Date(jamMasukHariIni.getTime() + 20 * 60000), // Anggap aja periksa 20 menit 🫩
      }
    });
  }

  console.log('Proses seeding selesai dengan sukses.');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });