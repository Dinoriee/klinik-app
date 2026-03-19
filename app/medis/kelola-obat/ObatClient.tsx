'use client'

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditObatButton from "@/components/ui/EditObatButton";
import DeleteObatButton from "@/components/ui/DeleteObatButton";

interface Obat {
  id_obat: string;
  nama_obat: string;
  nama_batch: string;
  jenis_obat: string;
  stok_saat_ini: number;
  satuan: string;
  expired_date: string;
  reorder_level: number;
}

interface NotificationItem {
  id_obat: string;
  obat: {
    nama_obat: string;
  };
  pesan: string;
  status: string;
}

export default function ObatClient({ obatList, query, notifications }: { obatList: Obat[]; query: string; notifications: NotificationItem[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  const [namaObat, setNamaObat] = useState("");
  const [namaBatch, setNamaBatch] = useState("");
  const [jenisObat, setJenisObat] = useState("tablet");
  const [satuan, setSatuan] = useState("");
  const [stok, setStok] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [expiredDate, setExpiredDate] = useState("");

  const formatTanggal = (tanggalString: string) => {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(tanggalString));
  };

  const tanggalHariIni = new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/obat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_obat: namaObat,
          nama_batch: namaBatch,
          jenis_obat: jenisObat,
          satuan,
          stok_saat_ini: parseInt(stok, 10),
          reorder_level: parseInt(reorderLevel, 10),
          expired_date: expiredDate,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setNamaObat("");
        setNamaBatch("");
        setJenisObat("tablet");
        setSatuan("");
        setStok("");
        setReorderLevel("");
        setExpiredDate("");
        toast.success("Obat berhasil ditambahkan");
        router.refresh();
      } else {
        toast.error("Gagal menyimpan data obat");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const dataToExport = obatList.map((obat, index) => {
        const isExpired = new Date(obat.expired_date) < tanggalHariIni;
        const isMenipis = obat.stok_saat_ini <= obat.reorder_level;

        let status = "Aman";
        if (isExpired) {
          status = "Kedaluwarsa";
        } else if (isMenipis) {
          status = "Menipis";
        }

        return {
          No: index + 1,
          "Nama Obat": obat.nama_obat,
          Batch: obat.nama_batch,
          Jenis: obat.jenis_obat.charAt(0).toUpperCase() + obat.jenis_obat.slice(1),
          "Stok Saat Ini": `${obat.stok_saat_ini} ${obat.satuan}`,
          "Batas Minimum (Reorder)": obat.reorder_level,
          "Tanggal Kedaluwarsa": formatTanggal(obat.expired_date),
          Status: status,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Obat");
      XLSX.writeFile(workbook, "Data_Stok_Obat_Klinik.xlsx");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Gagal mengexport file Excel");
    }
  };

  const totalPages = Math.ceil(obatList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = obatList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-black">Medis / Obat / <span className="text-white font-bold">Kelola Obat</span></h1>
        </div>
        <UserAccount notifications={notifications} userName={session?.user?.name || "Pegawai Medis"} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-bold text-lg text-black">Daftar Stok Obat</h2>
          <div className="flex space-x-3">
            <form method="GET" className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Cari obat / batch..."
              />
              <button type="submit" className="hidden">Cari</button>
            </form>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Tambah Obat
            </button>

            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nama Obat</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Batas Reorder</th>
                <th className="px-4 py-3 font-medium">Expired</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentData.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-6 text-gray-400">Tidak ada data obat.</td></tr>
              ) : (
                currentData.map((obat, index) => {
                  const actualNumber = startIndex + index + 1;
                  const isExpired = new Date(obat.expired_date) < tanggalHariIni;
                  const isMenipis = obat.stok_saat_ini <= obat.reorder_level;

                  let statusColor = "bg-green-100 text-green-700";
                  let statusText = "Aman";
                  if (isExpired) {
                    statusColor = "bg-red-100 text-red-700";
                    statusText = "Kedaluwarsa";
                  } else if (isMenipis) {
                    statusColor = "bg-yellow-100 text-yellow-700";
                    statusText = "Menipis";
                  }

                  return (
                    <tr key={obat.id_obat} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{actualNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{obat.nama_obat}</td>
                      <td className="px-4 py-3 text-gray-600">{obat.nama_batch}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{obat.jenis_obat}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isMenipis ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {obat.stok_saat_ini} {obat.satuan}
                        </span>
                      </td>
                      <td className="px-4 py-3">{obat.reorder_level}</td>
                      <td className="px-4 py-3">{formatTanggal(obat.expired_date)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-3 items-center">
                          <EditObatButton obat={obat} />
                          <DeleteObatButton id_obat={obat.id_obat} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {obatList.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, obatList.length)}</span> dari <span className="font-semibold text-gray-900">{obatList.length}</span> data
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-sm font-medium text-gray-700 px-4">
                Halaman {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Form Tambah Obat</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Nama Obat</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={namaObat}
                    onChange={(e) => setNamaObat(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Nomor Batch</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={namaBatch}
                    onChange={(e) => setNamaBatch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Jenis Obat</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={jenisObat}
                    onChange={(e) => setJenisObat(e.target.value)}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="kapsul">Kapsul</option>
                    <option value="sirup">Sirup</option>
                    <option value="salep">Salep</option>
                    <option value="injeksi">Injeksi</option>
                    <option value="tetes">Tetes</option>
                    <option value="puyer">Puyer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Cth: Strip, Botol"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Batas Reorder</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Tanggal Expired</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Obat"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
