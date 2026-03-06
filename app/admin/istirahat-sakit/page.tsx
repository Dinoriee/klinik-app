import prisma from "@/lib/db";
import IstirahatSakitClient from "./IstirahatSakitClient";

export default async function IstirahatSakitPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
    const presensiSakit = await prisma.presensi.findMany({
        where: {
            tipe: "sakit",
            pegawai: {
                OR: [
                    { nama_pegawai: { contains: query, mode: "insensitive" } },
                    { nik: { contains: query, mode: "insensitive" } },
                    { departemen: { contains: query, mode: "insensitive" } }
                ],
            },
        },
        include: {
            pegawai: true,
        },
        orderBy: {
            jam_masuk: "desc", 
        },
    });

    const serializedData = presensiSakit.map((p) => ({
        ...p,
        jam_masuk: p.jam_masuk.toISOString(),
        jam_keluar: p.jam_keluar ? p.jam_keluar.toISOString() : null,
    }));

    return <IstirahatSakitClient dataList={serializedData} query={query} />;
}