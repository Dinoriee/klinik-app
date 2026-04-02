'use client'
import { Download } from "lucide-react";
import React from "react";

interface User {
  [key: string]: string | number;
  total: number;
}

interface ExportExcelProps {
  currentData: User[]; 
  filterName: string;
  dataKey: string;
}

const ExportExcel = ({ currentData, filterName, dataKey }: ExportExcelProps) => {

  const handleExportExcel = async () => {
    if (!currentData || currentData.length === 0) return alert("Data kosong");

    try {
      const XLSX = await import("xlsx");

      const dataToExport = currentData.map((item, index) => ({
        "No": index + 1,
        "Keterangan": String(item[dataKey] || "-"),
        "Total Pengunjung": item.total,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pengunjung");

      const fileName = `Rekap_Pengunjung_${filterName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export gagal:", err);
    }
  };

  return (
    <button 
      onClick={handleExportExcel} 
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-all"
    >
      <Download size={16} /> Export Excel
    </button>
  );
};

export default ExportExcel;