"use client";

import { Search } from "lucide-react";
import TambahPenyakitButton from "@/components/ui/TambahPenyakitButton";
import EditPenyakitButton from "@/components/ui/EditPenyakitButton";
import DeletePenyakitButton from "@/components/ui/DeletePenyakitButton";

type Penyakit = {
  id_penyakit: number;
  nama_penyakit: string;
};

export default function PenyakitClient({
  penyakitList,
  query,
}: {
  penyakitList: Penyakit[];
  query: string;
}) {
  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between p-4">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik / Penyakit / <span className="text-black font-bold">Kelola Penyakit</span>
          </h1>
        </div>
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
                    <td className="px-4 py-3">{index + 1}</td>
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
      </div>
    </div>
  );
}
