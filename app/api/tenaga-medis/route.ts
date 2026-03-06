import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const id_tenaga_medis = data.id_tenaga_medis ? String(data.id_tenaga_medis) : null;
        const kode_tenaga_medis = data.kode_tenaga_medis;
        const nama_tenaga_medis = data.nama_tenaga_medis;
        const jabatan = data.jabatan;
        const nik = data.nik; 
        const email = data.email;
        const password = data.password;
        const role = data.role as "dokter" | "perawat";

        if (id_tenaga_medis && id_tenaga_medis !== "undefined") {
            const tenagaMedis = await prisma.tenaga_Medis.findUnique({ where: { id_tenaga_medis } });
            if (tenagaMedis) {
                await prisma.tenaga_Medis.update({
                    where: { id_tenaga_medis },
                    data: { kode_tenaga_medis, nama_tenaga_medis, jabatan, nik } 
                });

                if (password) {
                    await prisma.user.update({
                        where: { id_user: tenagaMedis.id_user },
                        data: { email, role, name: nama_tenaga_medis, password }
                    });
                } else {
                    await prisma.user.update({
                        where: { id_user: tenagaMedis.id_user },
                        data: { email, role, name: nama_tenaga_medis }
                    });
                }
            }
        } 
       
        else {
            const cekEmail = await prisma.user.findUnique({ where: { email } });
            if (cekEmail) {
                return NextResponse.json({ message: "Gagal: Email sudah terdaftar!" }, { status: 400 });
            }

            const cekKode = await prisma.tenaga_Medis.findFirst({ where: { kode_tenaga_medis } });
            if (cekKode) {
                return NextResponse.json({ message: "Gagal: Kode Tenaga Medis sudah terpakai!" }, { status: 400 });
            }

            if (nik) {
                 const cekNik = await prisma.tenaga_Medis.findFirst({ where: { nik } });
                 if (cekNik) {
                     return NextResponse.json({ message: "Gagal: NIK sudah terdaftar!" }, { status: 400 });
                 }
            }

            await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: { email, password, name: nama_tenaga_medis, role }
                });

                await tx.tenaga_Medis.create({
                    data: {
                        id_user: newUser.id_user, 
                        kode_tenaga_medis,
                        nama_tenaga_medis,
                        jabatan,
                        nik 
                    }
                });
            });
        }

        return NextResponse.json({ message: "Berhasil menyimpan data!" }, { status: 200 });
        
    } catch (error: unknown) {
        console.error("Error API Tenaga Medis:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_tenaga_medis = searchParams.get("id_tenaga_medis");

        if (id_tenaga_medis) {
            const idString = String(id_tenaga_medis);
            const tenagaMedis = await prisma.tenaga_Medis.findUnique({ where: { id_tenaga_medis: idString } });
            
            if (tenagaMedis) {
                await prisma.tenaga_Medis.delete({ where: { id_tenaga_medis: idString } });
                await prisma.user.delete({ where: { id_user: tenagaMedis.id_user } });
            }
            return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
        }
        
        return NextResponse.json({ message: "ID tidak ditemukan" }, { status: 400 });
        
    } catch (error: unknown) {
        console.error("Error API Hapus Tenaga Medis:", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal menghapus data";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}