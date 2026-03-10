import prisma from "@/lib/db";
import IstirahatSakitClient from "./IstirahatSakitClient";

export const dynamic = "force-dynamic";

export default async function IstirahatSakitAdminPage({
    searchParams,
}: {
    searchParams: { query?: string };
}) {
    const query = searchParams.query || "";

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

    return (
        <IstirahatSakitClient 
            dataList={serializedDataList} 
            query={query} 
        />
    );
}