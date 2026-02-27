import prisma from "@/lib/db";
import PenyakitClient from "./PenyakitClient";

export default async function KelolaPenyakit({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";

  const penyakitList = await prisma.penyakit.findMany({
    where: {
      nama_penyakit: { contains: query, mode: "insensitive" },
    },
    orderBy: { id_penyakit: "desc" },
  });

  return <PenyakitClient penyakitList={penyakitList} query={query} />;
}
