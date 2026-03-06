import prisma from "@/lib/db";
import IstirahatSakitMedisClient from "./IstirahatSakitMedisClient";

export default async function IstirahatSakitMedisPage({
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

    return <IstirahatSakitMedisClient dataList={serializedData} query={query} />;
}