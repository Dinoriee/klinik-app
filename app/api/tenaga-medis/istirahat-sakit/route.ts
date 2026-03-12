import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { nik_pegawai, status } = data;

        if (!nik_pegawai) {
            return NextResponse.json({ message: "NIK tidak boleh kosong!" }, { status: 400 });
        }

        // 1. Cari data pasien (pegawai) berdasarkan NIK yang di-scan
        const pegawai = await prisma.pegawai.findFirst({
            where: { nik: String(nik_pegawai) }
        });

        if (!pegawai) {
            return NextResponse.json({ message: `Gagal: NIK ${nik_pegawai} tidak terdaftar!` }, { status: 404 });
        }

        // 2. Simpan data ke tabel database (Sesuaikan 'presensi' dengan nama tabel Anda jika berbeda)
        await prisma.presensi.create({
            data: {
                id_pegawai: pegawai.id_pegawai,
                tipe: status || "sakit",
            }
        });

        return NextResponse.json(
            { message: `Sukses mencatat pasien sakit: ${pegawai.nama_pegawai}` }, 
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error("Error API Istirahat Sakit:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}