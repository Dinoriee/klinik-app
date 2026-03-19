"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import UserAccount from "@/components/ui/userAccount";
import TambahPenyakitButton from "@/components/ui/TambahPenyakitButton";
import EditPenyakitButton from "@/components/ui/EditPenyakitButton";
import DeletePenyakitButton from "@/components/ui/DeletePenyakitButton";
import { useSession } from "next-auth/react";

type Penyakit = {
  id_penyakit: string;
  nama_penyakit: string;
};

type NotificationItem = {
  id_obat: string;
  obat: {
    nama_obat: string;
  };
  pesan: string;
  status: string;
};

export default function PenyakitMedisClient({
  penyakitList,
  query,
  currentPage,
  totalPages,
  totalData,
  pageSize,
  notifications,
}: {
  penyakitList: Penyakit[];
  query: string;
  currentPage: number;
  totalPages: number;
  totalData: number;
  pageSize: number;
  notifications: NotificationItem[];
}) {
  const { data: session } = useSession();

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("query", query);
    }
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-black">
            Medis / Penyakit / <span className="text-white font-bold">Kelola Penyakit</span>
          </h1>
        </div>
        <UserAccount notifications={notifications} userName={session?.user?.name || "Pegawai Medis"} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-bold text-lg text-black">Data Penyakit</h2>
          <div className="flex space-x-3">
            <form method="GET" className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Cari nama penyakit..."
              />
              <button type="submit" className="hidden">Cari</button>
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
                    <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
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

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Menampilkan {penyakitList.length} dari {totalData} data
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildPageHref(Math.max(1, currentPage - 1))}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              Prev
            </Link>
            <span className="text-sm text-gray-600">
              Halaman {currentPage} / {totalPages}
            </span>
            <Link
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
