import prisma from "@/lib/db";
import PenyakitClient from "./PenyakitClient";

const PAGE_SIZE = 10;

export default async function KelolaPenyakit({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
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

  return (
    <PenyakitClient
      penyakitList={penyakitList}
      query={query}
      currentPage={currentPage}
      totalPages={totalPages}
      totalData={totalData}
      pageSize={PAGE_SIZE}
    />
  );
}
