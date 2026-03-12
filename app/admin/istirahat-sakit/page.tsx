import prisma from "@/lib/db";
import IstirahatSakitClient from "./IstirahatSakitClient";

export const dynamic = "force-dynamic";

export default async function IstirahatSakitAdminPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const params = await searchParams;
    const query = params.query || "";

    const dataList = await prisma.presensi.findMany({
        where: {
            tipe: "sakit",
            ...(query && {
                OR: [
                    { pegawai: { nik: { contains: query } } },
                    { pegawai: { nama_pegawai: { contains: query } } },
                    { pegawai: { departemen: { contains: query } } },
                ],
            }),
        },
        include: {
            pegawai: true, 
        },
        orderBy: {
            jam_masuk: "desc", 
        },
    });

    // Serialize dates to strings for client component
    const serializedDataList = dataList.map(item => ({
        ...item,
        jam_masuk: item.jam_masuk.toISOString(),
        jam_keluar: item.jam_keluar ? item.jam_keluar.toISOString() : null,
    }));

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

    return (
        <IstirahatSakitClient 
            dataList={serializedDataList} 
            query={query}
            notifications={notifications}
        />
    );
}