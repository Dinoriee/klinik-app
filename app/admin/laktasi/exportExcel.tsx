"use client";

import { Download, Search } from "lucide-react";

interface UserPresensi {
  id_presensi: string | number;
  jam_masuk: string | Date;
  jam_keluar: string | Date | null;
  keterangan: string;
  nama_tenaga_medis: string;
}

interface PresensiTableProps {
  users: UserPresensi[];
}

const ExportExcel = ({ users }: PresensiTableProps) => {
  const formatTanggal = (tanggalString: string | Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(new Date(tanggalString));
  };

  const handleExportExcel = async () => {
    if (users.length === 0) return alert("Tabel Kosong");

    try {
      const XLSX = await import("xlsx");
      const dataToExport = users.map((data, index) => ({
        "No": index + 1,
        "Nama": data.nama_tenaga_medis|| "-",
        "Tanggal": formatTanggal(data.jam_masuk),
        "Jam Masuk": new Date(data.jam_masuk).toLocaleTimeString(),
        "Jam Keluar": data.jam_keluar ? new Date(data.jam_keluar).toLocaleTimeString() : "-",
        "Keterangan": data.keterangan || "Istirahat Laktasi"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Istirahat Laktasi");
      XLSX.writeFile(workbook, `Rekap_Istirahat_Laktasi_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Export gagal:", err);
    }
  };

  return (
    <div className="">
          <button 
            onClick={handleExportExcel} 
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors"
          >
            <Download size={16} /> Export Excel
          </button>
    </div>
  );
};

export default ExportExcel;
