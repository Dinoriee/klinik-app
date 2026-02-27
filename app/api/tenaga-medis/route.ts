import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const id_tenaga_medis = data.id_tenaga_medis ? Number(data.id_tenaga_medis) : null;
        const kode_tenaga_medis = data.kode_tenaga_medis;
        const nama_tenaga_medis = data.nama_tenaga_medis;
        const jabatan = data.jabatan;
        
        const email = data.email;
        const password = data.password;
        const role = data.role as "dokter" | "perawat";

        if (id_tenaga_medis) {
            
            const tenagaMedis = await prisma.tenaga_Medis.findUnique({ where: { id_tenaga_medis } });
            if (tenagaMedis) {
                await prisma.tenaga_Medis.update({
                    where: { id_tenaga_medis },
                    data: { kode_tenaga_medis, nama_tenaga_medis, jabatan }
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
        } else {
            await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: { email, password, name: nama_tenaga_medis, role }
                });

                await tx.tenaga_Medis.create({
                    data: {
                        id_user: newUser.id_user,
                        kode_tenaga_medis,
                        nama_tenaga_medis,
                        jabatan
                    }
                });
            });
        }

        return NextResponse.json({ message: "Berhasil" }, { status: 200 });
        
    } catch (error: unknown) {
        console.error("Error API Tenaga Medis:", error);
        return NextResponse.json({ message: "Gagal menyimpan data" }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_tenaga_medis = searchParams.get("id_tenaga_medis");

        if (id_tenaga_medis) {
            const tenagaMedis = await prisma.tenaga_Medis.findUnique({ where: { id_tenaga_medis: Number(id_tenaga_medis) } });
            if (tenagaMedis) {
                await prisma.tenaga_Medis.delete({ where: { id_tenaga_medis: Number(id_tenaga_medis) } });
                await prisma.user.delete({ where: { id_user: tenagaMedis.id_user } });
            }
            return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
        }
        
        return NextResponse.json({ message: "ID tidak ditemukan" }, { status: 400 });
        
    } catch (error: unknown) {
        console.error("Error API Hapus Tenaga Medis:", error);
        return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
    }
}