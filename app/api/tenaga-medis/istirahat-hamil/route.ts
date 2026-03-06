import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import {
  closePresensiMedisById,
  ensureAktivitasMedisTable,
  findTodayPresensiIdByJenis,
  getPresensiMedisById,
  insertAktivitasMedis,
} from "@/lib/medisAktivitas";

export async function POST(req: Request) {
  try {
    await ensureAktivitasMedisTable();

    const { id_tenaga_medis, nik, nama } = await req.json();
    const trimmedNik = typeof nik === "string" ? nik.trim() : "";

    type TenagaMedisLookup = {
      id_tenaga_medis: number;
      nama_tenaga_medis: string;
    };

    let tenagaMedis: TenagaMedisLookup | null = null;
    if (id_tenaga_medis !== undefined && id_tenaga_medis !== null && id_tenaga_medis !== "") {
      const idAsNumber = Number(id_tenaga_medis);
      if (!Number.isNaN(idAsNumber)) {
        tenagaMedis = await prisma.tenaga_Medis.findUnique({
          where: { id_tenaga_medis: idAsNumber },
          select: { id_tenaga_medis: true, nama_tenaga_medis: true },
        });
      }
    }

    if (!tenagaMedis && trimmedNik) {
      try {
        const result = await prisma.$queryRaw<TenagaMedisLookup[]>`
          SELECT id_tenaga_medis, nama_tenaga_medis
          FROM "Tenaga_Medis"
          WHERE nik = ${trimmedNik}
          LIMIT 1
        `;
        if (result.length > 0) tenagaMedis = result[0];
      } catch {
        tenagaMedis = await prisma.tenaga_Medis.findFirst({
          where: { kode_tenaga_medis: trimmedNik },
          select: { id_tenaga_medis: true, nama_tenaga_medis: true },
        });
      }
    }

    if (!tenagaMedis) {
      return NextResponse.json({ message: "Tenaga medis tidak ditemukan." }, { status: 404 });
    }

    const idTenagaMedis = String(tenagaMedis.id_tenaga_medis);
    const existingPresensiId = await findTodayPresensiIdByJenis(idTenagaMedis, "istirahat_hamil");

    if (!existingPresensiId) {
      const created = await prisma.presensi_Tenaga_Medis.create({
        data: {
          id_tenaga_medis: tenagaMedis.id_tenaga_medis,
          keterangan: "izin",
        },
      });
      await insertAktivitasMedis({
        idTenagaMedis,
        idPresensi: String(created.id_presensi),
        jenis: "istirahat_hamil",
      });

      return NextResponse.json({
        message: `Pengajuan istirahat hamil berhasil, semoga sehat selalu ${nama || tenagaMedis?.nama_tenaga_medis}`,
      });
    }

    const existingPresensi = await getPresensiMedisById(existingPresensiId);
    if (!existingPresensi) {
      return NextResponse.json({ message: "Data presensi tidak ditemukan." }, { status: 404 });
    }

    if (existingPresensi.jam_keluar) {
      return NextResponse.json(
        { message: "Istirahat hamil untuk hari ini sudah selesai diproses." },
        { status: 400 }
      );
    }

    await closePresensiMedisById(existingPresensiId);

    return NextResponse.json({
      message: `Istirahat hamil selesai, semoga kondisi tetap nyaman ${nama || tenagaMedis?.nama_tenaga_medis}`,
    });
  } catch (error) {
    console.error("Error istirahat hamil:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
