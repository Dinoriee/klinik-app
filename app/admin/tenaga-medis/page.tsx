import { Search, SquarePen, Trash } from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db"; 
import Link from "next/link";
import { revalidatePath } from "next/cache";
import UserAccount from "@/components/ui/userAccount";
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