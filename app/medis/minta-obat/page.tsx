import prisma from "@/lib/db";
import MintaObatMedisClient from "./MintaObatMedisClient";

export default async function MintaObatMedisPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
    const obats = await prisma.obat.findMany({
        where: { stok_saat_ini: { gt: 0 } },
        select: { id_obat: true, nama_obat: true, stok_saat_ini: true, satuan: true },
        orderBy: { nama_obat: 'asc' }
    });

    // Mengambil riwayat transaksi
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

    return <MintaObatMedisClient riwayatList={serializedRiwayat} obats={obats} query={query} />;
}