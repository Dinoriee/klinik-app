"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import TambahPegawaiButton from "@/components/ui/TambahPegawaiButton";
import EditPegawaiButton from "@/components/ui/EditPegawaiButton";
import DeletePegawaiButton from "@/components/ui/DeletePegawaiButton";
import ImportPegawaiModal from "./importExcel";
import UserAccount from "@/components/ui/userAccount";

type Pegawai = {
  id_pegawai: number;
  nomor_pegawai: string;
  nama_pegawai: string;
  departemen: string;
};

export default function PegawaiClient({
  pegawaiList,
  query,
  currentPage,
  totalPages,
  totalData,
  pageSize,
  allPegawai,
  notifications,
  userName,
}: {
  pegawaiList: Pegawai[];
  query: string;
  currentPage: number;
  totalPages: number;
  totalData: number;
  pageSize: number;
  allPegawai: Pegawai[];
  notifications: Notif[];
  userName: string;
}) {
  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalData);

  const handleExportExcel = async () => {
        if (allPegawai.length === 0) return alert("Tidak ada data untuk diexport!");

        try {
            const XLSX = await import("xlsx");
            const dataToExport = allPegawai.map((data, index) => {
                return {
                    "No": index + 1,
                    "Nomor Pegawai": data.nomor_pegawai,
                    "Nama Pegawai": data.nama_pegawai || "-",
                    "Departemen": data.departemen || "-",
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pegawai");
            XLSX.writeFile(workbook, `Rekap_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Error exporting Excel:", error);
            alert("Gagal mengexport file Excel");
        }
    };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
        <span className="text-gray-100 font-bold text-lg leading-none">Kelola Pegawai</span>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={userName} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-bold text-lg text-black">Data Pegawai</h2>
          <div className="flex items-center gap-3">
            <form method="GET" className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Cari nama/nomor/departemen..."
              />
              <button type="submit" className="hidden">
                Cari
              </button>
            </form>
            <TambahPegawaiButton />
            <button 
                            onClick={handleExportExcel}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ml-2"
                            suppressHydrationWarning
                        >
                            <Download size={16} /> Export Excel
                        </button>
            <ImportPegawaiModal/>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nomor Pegawai</th>
                <th className="px-4 py-3 font-medium">Nama Pegawai</th>
                <th className="px-4 py-3 font-medium">Departemen</th>
                <th className="px-4 py-3 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pegawaiList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Data pegawai masih kosong.
                  </td>
                </tr>
              ) : (
                pegawaiList.map((pegawai, index) => (
                  <tr key={pegawai.id_pegawai} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{pegawai.nomor_pegawai}</td>
                    <td className="px-4 py-3">{pegawai.nama_pegawai}</td>
                    <td className="px-4 py-3">{pegawai.departemen}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-3 items-center">
                        <EditPegawaiButton pegawai={pegawai} />
                        <DeletePegawaiButton id_pegawai={pegawai.id_pegawai} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
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
