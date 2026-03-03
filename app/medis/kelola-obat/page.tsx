import prisma from "@/lib/db"; 
import ObatClient from "./ObatClient";

export default async function KelolaObat({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";

    const obatList = await prisma.obat.findMany({
        where: {
            OR: [
                { namaObat: { contains: query, mode: 'insensitive' } },
                { namaBatch: { contains: query, mode: 'insensitive' } },
            ]
        },
        orderBy: { idObat: 'desc' } 
    });

    const serializedObatList = obatList.map(obat => ({
        ...obat,
        expiredDate: obat.expiredDate.toISOString() 
    }));

    return <ObatClient obatList={serializedObatList} query={query} />;
}