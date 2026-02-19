import 'dotenv/config'
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
})

async function main() {
  const hashedPassword = await hash('123', 10)
  console.log('Memulai proses seeding data...');

  await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {},
    create: {
      email: 'admin@mail.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'dokter@mail.com' },
    update: {},
    create: {
      email: 'dokter@mail.com',
      password: hashedPassword,
      role: 'dokter',
      tenagaMedis: {
        create: {
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
      role: 'perawat',
      tenagaMedis: {
        create: {
          kode_tenaga_medis: 'NS-001',
          nama_tenaga_medis: 'Ns. Arif, S.Kep',
          jabatan: 'Kepala Perawat',
        },
      },
    },
  });

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