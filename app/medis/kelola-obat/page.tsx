import prisma from "@/lib/db"; 
import ObatClient from "./ObatClient";
import { getServerSession } from "next-auth/next";

export default async function KelolaObat({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
  const session = await getServerSession();
  
  const dataDariDB = await prisma.obat.findMany({
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

  const obatListYangSudahDiterjemahkan = dataDariDB.map((obat) => ({
    idObat: obat.id_obat, 
    namaObat: obat.nama_obat,
    namaBatch: obat.nama_batch,
    jenisObat: obat.jenis_obat,
    stokSaatIni: obat.stok_saat_ini,
    satuan: obat.satuan,
    expiredDate: obat.expired_date.toISOString(),
    reorderLevel: obat.reorder_level,
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
      <ObatClient obatList={obatListYangSudahDiterjemahkan} query={query} notifications={notifications} />
    </div>
  );
}
