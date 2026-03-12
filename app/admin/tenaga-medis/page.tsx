import prisma from "@/lib/db"; 
import TenagaMedisClient from "./TenagaMedisClient";
import { getServerSession } from "next-auth/next";

export default async function TenagaMedisPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
    const session = await getServerSession();

    const tenagaMedisList = await prisma.tenaga_Medis.findMany({
        where: {
            OR: [
                { nama_tenaga_medis: { contains: query, mode: 'insensitive' } },
                { kode_tenaga_medis: { contains: query, mode: 'insensitive' } },
            ]
        },
        include: {
            users: true 
        },
        orderBy: { id_tenaga_medis: 'desc' } 
    });

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

    return <TenagaMedisClient tenagaMedisList={tenagaMedisList} query={query} notifications={notifications} />;
}