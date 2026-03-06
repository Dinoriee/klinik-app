import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { id_pegawai, id_tenaga_medis, id_penyakit } = data;
        const idObats = Array.isArray(data.id_obat) ? data.id_obat : [data.id_obat];
        const jumlahs = Array.isArray(data.jumlah) ? data.jumlah : [data.jumlah];

        if (!id_pegawai || !id_tenaga_medis || !id_penyakit) {
            return NextResponse.json({ success: false, message: "Data Pasien, Dokter, dan Penyakit harus diisi!" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            const permintaan = await tx.permintaan_Obat.create({
                data: {
                    id_pegawai: String(id_pegawai),       
                    id_tenaga_medis: String(id_tenaga_medis),  
                    id_penyakit: String(id_penyakit),      
                }
            });

            for (let i = 0; i < idObats.length; i++) {
                
                const id_obat = String(idObats[i]); 
                const jumlah = Number(jumlahs[i]);

                if (id_obat && jumlah > 0 && id_obat !== "undefined") {
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
        
        return NextResponse.json({ success: true, message: "Berhasil menyimpan data obat!" }, { status: 200 });
        
    } catch (error: unknown) {
        console.error("Error API Minta Obat:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
        
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}