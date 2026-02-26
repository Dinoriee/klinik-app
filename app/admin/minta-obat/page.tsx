import prisma from "@/lib/db";
import MintaObatClient from "./MintaObatClient";

export default async function MintaObatPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
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

    const serializedRiwayat = riwayatList.map(riwayat => ({
        ...riwayat,
        waktu_permintaan: riwayat.waktu_permintaan.toISOString()
    }));

    return <MintaObatClient riwayatList={serializedRiwayat} query={query} />;
}