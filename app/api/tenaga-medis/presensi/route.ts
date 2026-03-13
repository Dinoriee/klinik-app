import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// app/api/presensi/route.ts
export async function POST(req: Request) {
  try{
    const { keterangan, nama, nik } = await req.json();

    const trimmedNik = typeof nik === "string" ? nik.trim() : "";
    if (!trimmedNik) {
      return NextResponse.json({ message: "NIK tidak boleh kosong!" }, { status: 400 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    type TenagaMedisLookup = { id_tenaga_medis: string; nama_tenaga_medis: string };
    let tenagaMedis: TenagaMedisLookup | null = null;

    try {
      const rows = await prisma.$queryRaw<TenagaMedisLookup[]>`
        SELECT CAST(id_tenaga_medis AS TEXT) AS id_tenaga_medis, nama_tenaga_medis
        FROM "Tenaga_Medis"
        WHERE CAST(nik AS TEXT) = ${trimmedNik}
        LIMIT 1
      `;
      tenagaMedis = rows[0] ?? null;
    } catch {
      // If the DB schema doesn't have `nik`, fall back to using `kode_tenaga_medis`.
      const rows = await prisma.$queryRaw<TenagaMedisLookup[]>`
        SELECT CAST(id_tenaga_medis AS TEXT) AS id_tenaga_medis, nama_tenaga_medis
        FROM "Tenaga_Medis"
        WHERE kode_tenaga_medis = ${trimmedNik}
        LIMIT 1
      `;
      tenagaMedis = rows[0] ?? null;
    }

    if (!tenagaMedis) {
      return NextResponse.json({ message: "NIK tidak terdaftar!" }, { status: 404 });
    }

    const id = tenagaMedis.id_tenaga_medis;

    const existing = await prisma.presensi_Tenaga_Medis.findFirst({
        where:{
            id_tenaga_medis: id,
            jam_masuk: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });
    
    const normalizedKeterangan = keterangan === "izin" ? "izin" : "hadir";

    if(!existing) {
        await prisma.presensi_Tenaga_Medis.create({
            data:{
                id_tenaga_medis: id,
                keterangan: normalizedKeterangan,
            },
        });
        return NextResponse.json({message: `Sukses Check In, Halo ${nama || tenagaMedis.nama_tenaga_medis}`})
    }

    if(existing && existing.jam_keluar) {
        return NextResponse.json(
            {message: "Anda sudah melakukan check out"},
            {status: 400}
        );
    }

    await prisma.presensi_Tenaga_Medis.update({
        where: {id_presensi: existing.id_presensi},
        data: {jam_keluar: new Date()},
    });

    return NextResponse.json({message: `Check out sukses, hati-hati di jalan ${nama || tenagaMedis.nama_tenaga_medis}`});
  }catch (error){
    console.error(error);
    return NextResponse.json({message: "Something went wrong"}, {status: 500})
  }
}
