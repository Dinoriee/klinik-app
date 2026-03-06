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

    const { id_tenaga_medis, nama } = await req.json();

    const parsedId = Number(id_tenaga_medis);
    if (!parsedId) {
      return NextResponse.json({ message: "ID tenaga medis tidak valid." }, { status: 400 });
    }

    const tenagaMedis = await prisma.tenaga_Medis.findUnique({
      where: {
        id_tenaga_medis: parsedId,
      },
    });

    const idTenagaMedis = String(parsedId);
    const existingPresensiId = await findTodayPresensiIdByJenis(idTenagaMedis, "laktasi");

    if (!existingPresensiId) {
      const created = await prisma.presensi_Tenaga_Medis.create({
        data: {
          id_tenaga_medis: parsedId,
          keterangan: "izin",
        },
      });
      await insertAktivitasMedis({
        idTenagaMedis,
        idPresensi: String(created.id_presensi),
        jenis: "laktasi",
      });

      return NextResponse.json({
        message: `Sesi laktasi dimulai, semoga nyaman ${nama || tenagaMedis?.nama_tenaga_medis}`,
      });
    }

    const existingPresensi = await getPresensiMedisById(existingPresensiId);
    if (!existingPresensi) {
      return NextResponse.json({ message: "Data presensi tidak ditemukan." }, { status: 404 });
    }

    if (existingPresensi.jam_keluar) {
      return NextResponse.json(
        { message: "Sesi laktasi hari ini sudah selesai diproses." },
        { status: 400 }
      );
    }

    await closePresensiMedisById(existingPresensiId);

    return NextResponse.json({
      message: `Sesi laktasi selesai, terima kasih ${nama || tenagaMedis?.nama_tenaga_medis}`,
    });
  } catch (error) {
    console.error("Error laktasi:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
