import prisma from "@/lib/db";
import MintaObatClient from "./MintaObatClient";
import { getServerSession } from "next-auth/next";

export default async function MintaObatPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
    const session = await getServerSession();
    
    const riwayatList = await prisma.permintaan_Obat.findMany({
        orderBy: { waktu_permintaan: 'desc' },
        include: {
            pegawai: true,
            tenaga_medis: true,
            penyakit: true,
            detail_permintaan: {
                include: { obat: true }
            }
        }
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

    const serializedRiwayat = riwayatList.map(riwayat => ({
        ...riwayat,
        waktu_permintaan: riwayat.waktu_permintaan.toISOString()
    }));

    return <MintaObatClient riwayatList={serializedRiwayat} query={query} notifications={notifications} />;
}