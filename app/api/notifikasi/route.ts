import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    await prisma.notifikasi.updateMany({
      where: { status: 'unread' },
      data: { status: 'read' }
    });
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update" }, { status: 500 });
  }
}