import KonsultasiDokterClient from "./KonsultasiDokterClient";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";

export default async function KonsultasiDokterPage() {
  const session = await getServerSession();
  
  const notifications = await prisma.notifikasi.findMany({
    select:{
        id_obat: true,
        obat:{
            select:{
                nama_obat: true,
            }
        },
        pesan: true,
        status: true,
    },
    orderBy:[
        {status: 'desc'},
        {id_notifikasi: 'asc'},
    ]
  });
  
  return <KonsultasiDokterClient notifications={notifications} />;
}