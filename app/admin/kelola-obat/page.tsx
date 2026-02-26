import prisma from "@/lib/db"; 
import Link from "next/link";
import { revalidatePath } from "next/cache";
import UserAccount from "@/components/ui/userAccount";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/lib/auth";
import ObatClient from "./ObatClient";

export default async function KelolaObat({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";
    const session = await getServerSession(AuthOptions);

    const obatList = await prisma.obat.findMany({
        where: {
            OR: [
                { nama_obat: { contains: query, mode: 'insensitive' } },
                { nama_batch: { contains: query, mode: 'insensitive' } },
            ]
        },
        orderBy: { id_obat: 'desc' } 
    });

    const serializedObatList = obatList.map(obat => ({
        ...obat,
        expired_date: obat.expired_date.toISOString() 
    }));

    return <ObatClient obatList={serializedObatList} query={query} />;
}