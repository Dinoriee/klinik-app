import prisma from "@/lib/db"; 
import ObatClient from "./ObatClient";

export default async function KelolaObat({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }> | { query?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
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

  return (
    <div className="w-full">
      <ObatClient obatList={obatListYangSudahDiterjemahkan} query={query} />
    </div>
  );
}
