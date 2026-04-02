"use client";

import { Download, Search } from "lucide-react";

interface User {
  jabatan: string | number;
  email: string;
  name: string;
  tenagaMedis:{
    nama_tenaga_medis: string;
  }
}

interface PresensiTableProps {
  users: User[];
}

const ExportExcel = ({ users }: PresensiTableProps) => {

  const handleExportExcel = async () => {
    if (users.length === 0) return alert("Tabel Kosong");

    try {
      const XLSX = await import("xlsx");
      const dataToExport = users.map((data, index) => ({
        "No": index + 1,
        "Nama": data.tenagaMedis?.nama_tenaga_medis|| data.name || "-",
        "Email": data.email,
        "Role User": data.jabatan,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "User");
      XLSX.writeFile(workbook, `Rekap_User_${new Date().toISOString().split('T')[0]}.xlsx`);
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
