import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// app/api/presensi/route.ts
export async function POST(req: Request) {
  try{
    const { id_tenaga_medis, keterangan, nama } = await req.json();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.presensi_Tenaga_Medis.findFirst({
        where:{
            id_tenaga_medis: Number(id_tenaga_medis),
            jam_masuk: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const getName = await prisma.tenaga_Medis.findUnique({
        where:{
            id_tenaga_medis: Number(id_tenaga_medis),
        },
    });
    

    if(!existing) {
        await prisma.presensi_Tenaga_Medis.create({
            data:{
                id_tenaga_medis: parseInt(id_tenaga_medis),
                keterangan: keterangan || 'hadir',
            },
        });
        return NextResponse.json({message: `Sukses Check In, Halo ${nama || getName?.nama_tenaga_medis}`})
    }

    if(existing && existing.jam_keluar) {
        return NextResponse.json(
            {message: "Anda sudah melakukan check out"},
            {status: 400}
        );
    }

    await prisma.presensi_Tenaga_Medis.update({
        where: {id_presensi: existing.id_presensi},
        data: {jam_keluar: new Date()},
    });

    return NextResponse.json({message: `Check out sukses, hati-hati di jalan ${nama || getName?.nama_tenaga_medis}`});
  }catch (error){
    console.error(error);
    return NextResponse.json({message: "Something went wrong"}, {status: 500})
  }
}
