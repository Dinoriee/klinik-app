import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const id_penyakit = data.id_penyakit ? Number(data.id_penyakit) : null;
    const nama_penyakit = data.nama_penyakit?.trim();

    if (!nama_penyakit) {
      return NextResponse.json({ message: "Nama penyakit wajib diisi." }, { status: 400 });
    }

    if (id_penyakit) {
      await prisma.penyakit.update({
        where: { id_penyakit },
        data: { nama_penyakit },
      });
    } else {
      await prisma.penyakit.create({
        data: { nama_penyakit },
      });
    }

    return NextResponse.json({ message: "Berhasil" }, { status: 200 });
  } catch (error) {
    console.error("Error API Penyakit:", error);
    return NextResponse.json({ message: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_penyakit = searchParams.get("id_penyakit");

    if (!id_penyakit) {
      return NextResponse.json({ message: "ID tidak ditemukan" }, { status: 400 });
    }

    await prisma.penyakit.delete({
      where: { id_penyakit: Number(id_penyakit) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error API Hapus Penyakit:", error);
    return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
  }
}
