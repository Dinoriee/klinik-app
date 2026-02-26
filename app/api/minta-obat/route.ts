import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const idObats = data.id_obat; 
        const jumlahs = data.jumlah;

        await prisma.$transaction(async (tx) => {
            const dummyPegawai = await tx.pegawai.findFirst();
            const dummyTenagaMedis = await tx.tenaga_Medis.findFirst();
            const dummyPenyakit = await tx.penyakit.findFirst();

            if (!dummyPegawai || !dummyTenagaMedis || !dummyPenyakit) {
                throw new Error("Gagal! Kamu harus punya minimal 1 data Pegawai, Tenaga Medis, dan Penyakit di database.");
            }

            const permintaan = await tx.permintaan_Obat.create({
                data: {
                    id_pegawai: dummyPegawai.id_pegawai,       
                    id_tenaga_medis: dummyTenagaMedis.id_tenaga_medis,  
                    id_penyakit: dummyPenyakit.id_penyakit,      
                }
            });

            for (let i = 0; i < idObats.length; i++) {
                const id_obat = Number(idObats[i]);
                const jumlah = Number(jumlahs[i]);

                if (id_obat && jumlah > 0) {
                    const cekObat = await tx.obat.findUnique({ where: { id_obat: id_obat } });

                    if (!cekObat || cekObat.stok_saat_ini < jumlah) {
                        throw new Error(`Stok obat ${cekObat?.nama_obat || ''} tidak mencukupi!`);
                    }

                    await tx.detail_Permintaan_Obat.create({
                        data: {
                            id_permintaan: permintaan.id_permintaan,
                            id_obat: id_obat,
                            jumlah_diminta: jumlah
                        }
                    });

                    await tx.obat.update({
                        where: { id_obat: id_obat },
                        data: { stok_saat_ini: { decrement: jumlah } }
                    });
                }
            }
        });
        
        return NextResponse.json({ success: true, message: "Berhasil" }, { status: 200 });
    } catch (error: any) {
        console.error("Error API Minta Obat:", error);
        return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan." }, { status: 500 });
    }
}