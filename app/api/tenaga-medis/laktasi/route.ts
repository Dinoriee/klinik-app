import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { nik, nama } = await req.json();
    const trimmedNik = typeof nik === "string" ? nik.trim() : "";
    if (!trimmedNik) {
      return NextResponse.json({ message: "NIK tidak boleh kosong!" }, { status: 400 });
    }

    const pegawai = await prisma.pegawai.findFirst({
      where: { nik: trimmedNik },
      select: { id_pegawai: true, nama_pegawai: true },
    });

    if (!pegawai) {
      return NextResponse.json({ message: "Pegawai tidak ditemukan." }, { status: 404 });
    }

    const existingRows = await prisma.$queryRaw<{ id_presensi: string; jam_keluar: Date | null }[]>`
      SELECT id_presensi, jam_keluar
      FROM "Presensi"
      WHERE id_pegawai = ${pegawai.id_pegawai}
        AND tipe = 'laktasi'
        AND jam_masuk::date = CURRENT_DATE
      ORDER BY jam_masuk DESC
      LIMIT 1
    `;

    const existing = existingRows[0] ?? null;

    if (!existing) {
      await prisma.presensi.create({
        data: { id_pegawai: pegawai.id_pegawai, tipe: "laktasi" },
      });

      revalidatePath("/admin/laktasi");
      revalidatePath("/medis/laktasi");

      return NextResponse.json({
        message: `Sesi laktasi dimulai, semoga nyaman ${nama || pegawai.nama_pegawai}`,
      });
    }

    if (existing.jam_keluar) {
      return NextResponse.json(
        { message: "Sesi laktasi hari ini sudah selesai diproses." },
        { status: 400 }
      );
    }

    await prisma.presensi.update({
      where: { id_presensi: existing.id_presensi },
      data: { jam_keluar: new Date() },
    });

    revalidatePath("/admin/laktasi");
    revalidatePath("/medis/laktasi");

    return NextResponse.json({
      message: `Sesi laktasi selesai, terima kasih ${nama || pegawai.nama_pegawai}`,
    });
  } catch (error) {
    console.error("Error laktasi:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
