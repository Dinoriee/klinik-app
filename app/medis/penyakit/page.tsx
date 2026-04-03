import prisma from "@/lib/db";
import TambahPenyakitButton from "@/components/ui/TambahPenyakitButton";
import EditPenyakitButton from "@/components/ui/EditPenyakitButton";
import DeletePenyakitButton from "@/components/ui/DeletePenyakitButton";
import UserAccount from "@/components/ui/userAccount";
import { getServerSession } from "next-auth";
import { AuthOptions } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 5;

export default async function KelolaPenyakitMedis({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const session = await getServerSession(AuthOptions);
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
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalData);

  const penyakitList = await prisma.penyakit.findMany({
    where,
    orderBy: { id_penyakit: "desc" },
    skip: startIndex,
    take: PAGE_SIZE,
  });

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

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
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
        <div className="flex flex-col">
          <span className="text-gray-100 font-bold text-lg leading-none">Kelola Penyakit</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Medis"} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-bold text-lg text-black">Data Penyakit</h2>
          <div className="flex space-x-3">
            <form method="GET" className="relative flex items-center">
              <input
                type="text"
                name="query"
                defaultValue={query}
                className="pl-4 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Cari nama penyakit..."
              />
              <button type="submit" className="hidden">
                Cari
              </button>
            </form>
            <TambahPenyakitButton />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nama Penyakit</th>
                <th className="px-4 py-3 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {penyakitList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-400">
                    Data penyakit masih kosong.
                  </td>
                </tr>
              ) : (
                penyakitList.map((penyakit, index) => (
                  <tr key={penyakit.id_penyakit} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{penyakit.nama_penyakit}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-3 items-center">
                        <EditPenyakitButton penyakit={penyakit} />
                        <DeletePenyakitButton id_penyakit={penyakit.id_penyakit} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-900">{totalData === 0 ? 0 : startIndex + 1}</span> -{" "}
            <span className="font-semibold text-gray-900">{endIndex}</span> dari{" "}
            <span className="font-semibold text-gray-900">{totalData}</span> data
          </span>

          <div className="flex items-center gap-2">
            <Link
              href={buildPageHref(Math.max(1, currentPage - 1))}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Prev</span>
            </Link>
            <span className="text-sm font-bold text-gray-700">
              Halaman {currentPage} / {totalPages}
            </span>
            <Link
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <ChevronRight size={16} />
              <span className="sr-only">Next</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
