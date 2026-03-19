import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// FUNGSI POST: Untuk Menyimpan (Tambah/Edit)
export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Konversi tipe data agar sesuai dengan Prisma
        const id_obat = typeof data.id_obat === "string" ? data.id_obat : null;
        const stok_saat_ini = Number(data.stok_saat_ini);
        const reorder_level = Number(data.reorder_level);
        const expired_date = new Date(data.expired_date).toISOString();

        if (!data.nama_obat || !data.nama_batch || Number.isNaN(stok_saat_ini) || Number.isNaN(reorder_level)) {
            return NextResponse.json({ message: "Data obat tidak valid" }, { status: 400 });
        }

        if (id_obat) {
            // JIKA ADA ID -> MODE EDIT
            await prisma.obat.update({
                where: { id_obat },
                data: {
                    nama_obat: data.nama_obat,
                    nama_batch: data.nama_batch,
                    jenis_obat: data.jenis_obat,
                    satuan: data.satuan,
                    stok_saat_ini,
                    reorder_level,
                    expired_date
                }
            });
        } else {
            // JIKA TIDAK ADA ID -> MODE TAMBAH BARU
            await prisma.obat.create({
                data: {
                    nama_obat: data.nama_obat,
                    nama_batch: data.nama_batch,
                    jenis_obat: data.jenis_obat,
                    satuan: data.satuan,
                    stok_saat_ini,
                    reorder_level,
                    expired_date
                }
            });
        }

        return NextResponse.json({ message: "Berhasil" }, { status: 200 });
    } catch (error) {
        console.error("Error API Obat:", error);
        return NextResponse.json({ message: "Gagal menyimpan data" }, { status: 500 });
    }
}

// FUNGSI DELETE: Untuk Menghapus
export async function DELETE(request: Request) {
    try {
        // Mengambil ID obat dari URL (contoh: /api/obat?id_obat=1)
        const { searchParams } = new URL(request.url);
        const id_obat = searchParams.get("id_obat");

        if (id_obat) {
            await prisma.obat.delete({
                where: { id_obat }
            });
            return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
        }
        
        return NextResponse.json({ message: "ID tidak ditemukan" }, { status: 400 });
    } catch (error) {
        console.error("Error API Hapus Obat:", error);
        return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
    }
}
