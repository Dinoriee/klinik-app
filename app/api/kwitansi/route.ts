import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

// GET - Mengambil daftar kwitansi dengan data rekam medis terkait
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";
        const status = searchParams.get("status");

        const where: any = {};

        // Filter berdasarkan query (nama pasien atau nomor kwitansi)
        if (query) {
            where.OR = [
                {
                    rekam_medis: {
                        pegawai: {
                            nama_pegawai: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    },
                },
                {
                    id_kwitansi: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Filter berdasarkan status pembayaran
        if (status) {
            where.status = status;
        }

        const kwitansiList = await prisma.kwitansi.findMany({
            where,
            include: {
                rekam_medis: {
                    include: {
                        pegawai: {
                            select: {
                                id_pegawai: true,
                                nama_pegawai: true,
                                nomor_pegawai: true,
                            },
                        },
                        tenaga_medis: {
                            select: {
                                id_tenaga_medis: true,
                                nama_tenaga_medis: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                tanggal_terbit: "desc",
            },
        });

        return NextResponse.json(kwitansiList);
    } catch (error) {
        console.error("Error GET Kwitansi:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data kwitansi" },
            { status: 500 }
        );
    }
}

// PUT - Update status pembayaran kwitansi
export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id_kwitansi, status, total_biaya } = data;

        if (!id_kwitansi) {
            return NextResponse.json(
                { message: "ID kwitansi harus disertakan" },
                { status: 400 }
            );
        }

        const updateData: any = {
            status,
        };

        if (total_biaya) {
            updateData.total_biaya = parseFloat(total_biaya);
        }

        // Jika status berubah menjadi lunas, set tanggal_lunas
        if (status === "lunas") {
            updateData.tanggal_lunas = new Date();
        }

        const kwitansi = await prisma.kwitansi.update({
            where: { id_kwitansi },
            data: updateData,
            include: {
                rekam_medis: {
                    include: {
                        pegawai: true,
                        tenaga_medis: true,
                    },
                },
            },
        });

        // Revalidate both admin and medis kwitansi pages
        revalidatePath("/admin/kwitansi");
        revalidatePath("/medis/kwitansi");

        return NextResponse.json(
            { message: "Berhasil diperbarui", kwitansi },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error PUT Kwitansi:", error);
        return NextResponse.json(
            { message: "Gagal memperbarui data kwitansi" },
            { status: 500 }
        );
    }
}

// DELETE - Menghapus kwitansi
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_kwitansi = searchParams.get("id_kwitansi");

        if (!id_kwitansi) {
            return NextResponse.json(
                { message: "ID kwitansi tidak ditemukan" },
                { status: 400 }
            );
        }

        await prisma.kwitansi.delete({
            where: { id_kwitansi },
        });

        // Revalidate both admin and medis kwitansi pages
        revalidatePath("/admin/kwitansi");
        revalidatePath("/medis/kwitansi");

        return NextResponse.json(
            { message: "Kwitansi berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error DELETE Kwitansi:", error);
        return NextResponse.json(
            { message: "Gagal menghapus kwitansi" },
            { status: 500 }
        );
    }
}
