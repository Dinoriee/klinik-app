import prisma from "./db";

export type JenisAktivitasMedis = "istirahat_hamil" | "laktasi";

type RiwayatRow = {
  id_presensi: string | number;
  jam_masuk: Date | string;
  jam_keluar: Date | string | null;
  nama_tenaga_medis: string | null;
};

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

export async function ensureAktivitasMedisTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Aktivitas_Medis" (
      "id_aktivitas" SERIAL PRIMARY KEY,
      "id_tenaga_medis" TEXT NOT NULL,
      "id_presensi" TEXT NOT NULL,
      "jenis" TEXT NOT NULL,
      "tanggal" DATE NOT NULL DEFAULT CURRENT_DATE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Aktivitas_Medis_tenaga_tanggal_idx"
    ON "Aktivitas_Medis" ("id_tenaga_medis", "tanggal", "jenis")
  `);
}

export async function findTodayPresensiIdByJenis(idTenagaMedis: string, jenis: JenisAktivitasMedis) {
  const rows = await prisma.$queryRaw<{ id_presensi: string }[]>`
    SELECT id_presensi
    FROM "Aktivitas_Medis"
    WHERE id_tenaga_medis = ${idTenagaMedis}
      AND jenis = ${jenis}
      AND tanggal = CURRENT_DATE
    ORDER BY id_aktivitas DESC
    LIMIT 1
  `;

  return rows[0]?.id_presensi ?? null;
}

export async function insertAktivitasMedis(params: {
  idTenagaMedis: string;
  idPresensi: string;
  jenis: JenisAktivitasMedis;
}) {
  await prisma.$executeRaw`
    INSERT INTO "Aktivitas_Medis" ("id_tenaga_medis", "id_presensi", "jenis")
    VALUES (${params.idTenagaMedis}, ${params.idPresensi}, ${params.jenis})
  `;
}

export async function getPresensiMedisById(idPresensi: string) {
  const rows = await prisma.$queryRaw<{ id_presensi: string | number; jam_keluar: Date | string | null }[]>`
    SELECT id_presensi, jam_keluar
    FROM "Presensi_Tenaga_Medis"
    WHERE CAST(id_presensi AS TEXT) = ${idPresensi}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function closePresensiMedisById(idPresensi: string) {
  await prisma.$executeRaw`
    UPDATE "Presensi_Tenaga_Medis"
    SET jam_keluar = NOW()
    WHERE CAST(id_presensi AS TEXT) = ${idPresensi}
  `;
}

export async function getRiwayatAktivitasMedis(jenis: JenisAktivitasMedis) {
  const rows = await prisma.$queryRaw<RiwayatRow[]>`
    SELECT
      a.id_presensi,
      p.jam_masuk,
      p.jam_keluar,
      t.nama_tenaga_medis
    FROM "Aktivitas_Medis" a
    INNER JOIN "Presensi_Tenaga_Medis" p
      ON CAST(p.id_presensi AS TEXT) = a.id_presensi
    LEFT JOIN "Tenaga_Medis" t
      ON CAST(t.id_tenaga_medis AS TEXT) = a.id_tenaga_medis
    WHERE a.jenis = ${jenis}
    ORDER BY p.jam_masuk DESC
  `;

  return rows.map((row) => ({
    id_presensi: String(row.id_presensi),
    jam_masuk: toDate(row.jam_masuk),
    jam_keluar: row.jam_keluar ? toDate(row.jam_keluar) : null,
    nama_tenaga_medis: row.nama_tenaga_medis,
  }));
}
