import prisma from "@/lib/db";
import PegawaiClient from "./PegawaiClient";

const PAGE_SIZE = 10;

export default async function KelolaPegawai({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
  const pageParam = Number(resolvedSearchParams.page || "1");
  const requestedPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const where = {
    OR: [
      { nama_pegawai: { contains: query, mode: "insensitive" as const } },
      { nomor_pegawai: { contains: query, mode: "insensitive" as const } },
      { departemen: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const totalData = await prisma.pegawai.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const pegawaiList = await prisma.pegawai.findMany({
    where,
    orderBy: { id_pegawai: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const allPegawai = await prisma.pegawai.findMany({})

  return (
    <PegawaiClient
      pegawaiList={pegawaiList}
      query={query}
      currentPage={currentPage}
      totalPages={totalPages}
      totalData={totalData}
      pageSize={PAGE_SIZE}
      allPegawai={allPegawai}
    />
  );
}
