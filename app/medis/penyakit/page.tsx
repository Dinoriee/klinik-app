import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/lib/auth";
import PenyakitMedisClient from "./PenyakitMedisClient";

const PAGE_SIZE = 5;

export default async function KelolaPenyakitMedis({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  await getServerSession(AuthOptions);

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
  const pageParam = Number(resolvedSearchParams.page || "1");
  const requestedPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const where = {
    nama_penyakit: { contains: query, mode: "insensitive" as const },
  };

  const totalData = await prisma.penyakit.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const penyakitList = await prisma.penyakit.findMany({
    where,
    orderBy: { id_penyakit: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const notifications = await prisma.notifikasi.findMany({
    select: {
      id_obat: true,
      obat: {
        select: {
          nama_obat: true,
        },
      },
      pesan: true,
      status: true,
    },
    orderBy: [
      { status: "desc" },
      { id_notifikasi: "asc" },
    ],
  });

  return (
    <PenyakitMedisClient
      penyakitList={penyakitList}
      query={query}
      currentPage={currentPage}
      totalPages={totalPages}
      totalData={totalData}
      pageSize={PAGE_SIZE}
      notifications={notifications}
    />
  );
}
