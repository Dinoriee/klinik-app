import prisma from "@/lib/db"; 
import TenagaMedisClient from "./TenagaMedisClient";

export default async function TenagaMedisPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";

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

    return <TenagaMedisClient tenagaMedisList={tenagaMedisList} query={query} />;
}