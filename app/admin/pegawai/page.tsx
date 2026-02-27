import prisma from "@/lib/db";
import PegawaiClient from "./PegawaiClient";

export default async function KelolaPegawai({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";

  const pegawaiList = await prisma.pegawai.findMany({
    where: {
      OR: [
        { nama_pegawai: { contains: query, mode: "insensitive" } },
        { nomor_pegawai: { contains: query, mode: "insensitive" } },
        { departemen: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { id_pegawai: "desc" },
  });

  return <PegawaiClient pegawaiList={pegawaiList} query={query} />;
}
