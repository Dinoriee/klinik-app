import prisma from "@/lib/db";
import ObatClient from "./ObatClient";
import { getServerSession } from "next-auth/next";
import { AuthOptions } from "@/lib/auth";

export default async function KelolaObat({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
  await getServerSession(AuthOptions);
  
  const obatList = await prisma.obat.findMany({
    where: {
      OR: [
        { nama_obat: { contains: query, mode: "insensitive" } },
        { nama_batch: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: {
      id_obat: "desc",
    },
  });

  const serializedObatList = obatList.map((obat) => ({
    ...obat,
    expired_date: obat.expired_date.toISOString(),
  }));

  const notifications = await prisma.notifikasi.findMany({
    select:{
        id_obat: true,
        obat:{
            select:{
                nama_obat: true,
            }
        },
        pesan: true,
        status: true,
    },
    orderBy:[
        {status: 'desc'},
        {id_notifikasi: 'asc'},
    ]
  });

  return (
    <div className="w-full">
      <ObatClient obatList={serializedObatList} query={query} notifications={notifications} />
    </div>
  );
}
