import prisma from "@/lib/db"; 
import KonsultasiAdminClient from "./KonsultasiAdminClient";

export default async function AdminKonsultasiPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
    const rekamList = await prisma.rekam_Medis.findMany({
        where: {
            OR: [
                { pegawai: { nama_pegawai: { contains: query, mode: 'insensitive' } } },
                { tenaga_medis: { nama_tenaga_medis: { contains: query, mode: 'insensitive' } } },
                { diagnosa: { contains: query, mode: 'insensitive' } }
            ]
        },
        include: {
            pegawai: true,
            tenaga_medis: true
        },
        orderBy: { tanggal_periksa: 'desc' } 
    });

    const notifications = await prisma.notifikasi.findMany({
        include: {
            obat: { select: { nama_obat: true } }
        },
        orderBy: { id_notifikasi: 'desc' }
    });

    const serializedRekam = rekamList.map(rekam => ({
        ...rekam,
        tensi: rekam.tensi,
        suhu: rekam.suhu,
        tanggal_periksa: rekam.tanggal_periksa.toISOString()
    }));

    return <KonsultasiAdminClient rekamList={serializedRekam} query={query} notifications={notifications} />;
}