import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const id_pegawai = data.id_pegawai ? Number(data.id_pegawai) : null;
    const nomor_pegawai = data.nomor_pegawai?.trim();
    const nama_pegawai = data.nama_pegawai?.trim();
    const departemen = data.departemen?.trim();

    if (!nomor_pegawai || !nama_pegawai || !departemen) {
      return NextResponse.json(
        { message: "Nomor pegawai, nama, dan departemen wajib diisi." },
        { status: 400 }
      );
    }

    if (id_pegawai) {
      await prisma.pegawai.update({
        where: { id_pegawai },
        data: { nomor_pegawai, nama_pegawai, departemen },
      });
    } else {
      await prisma.pegawai.create({
        data: { nomor_pegawai, nama_pegawai, departemen },
      });
    }

    return NextResponse.json({ message: "Berhasil" }, { status: 200 });
  } catch (error) {
    console.error("Error API Pegawai:", error);
    return NextResponse.json({ message: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_pegawai = searchParams.get("id_pegawai");

    if (!id_pegawai) {
      return NextResponse.json({ message: "ID tidak ditemukan" }, { status: 400 });
    }

    await prisma.pegawai.delete({
      where: { id_pegawai: Number(id_pegawai) },
    });

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error API Hapus Pegawai:", error);
    return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
  }
}
