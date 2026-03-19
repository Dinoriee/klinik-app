import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { syncMedicineNotifications } from "@/lib/notifikasi";

export async function POST() {
  try {
    const result = await syncMedicineNotifications();
    return NextResponse.json({ message: "Success", ...result });
  } catch {
    return NextResponse.json({ message: "Gagal sinkronisasi" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await prisma.notifikasi.updateMany({
      where: { status: 'unread' },
      data: { status: 'read' }
    });
    return NextResponse.json({ message: "Success" });
  } catch {
    return NextResponse.json({ message: "Gagal update" }, { status: 500 });
  }
}
