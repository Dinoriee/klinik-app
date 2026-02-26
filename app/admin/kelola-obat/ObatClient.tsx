"use client";

import { Search } from "lucide-react";
import TambahObatButton from "@/components/ui/TambahObatButton"; 
import EditObatButton from "@/components/ui/EditObatButton";     
import DeleteObatButton from "@/components/ui/DeleteObatButton"; 
import * as XLSX from "xlsx"; 

interface Obat {
    id_obat: number;
    nama_obat: string;
    nama_batch: string;
    jenis_obat: string;
    stok_saat_ini: number;
    satuan: string;
    expired_date: string;
    reorder_level: number;
}

export default function ObatClient({ obatList, query }: { obatList: Obat[], query: string }) {

    const formatTanggal = (tanggalString: string) => {
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(tanggalString));
    };

    const tanggalHariIni = new Date();
    const handleExportExcel = () => {
        const dataToExport = obatList.map((obat, index) => {
            const isExpired = new Date(obat.expired_date) < tanggalHariIni;
            const isMenipis = obat.stok_saat_ini <= obat.reorder_level;
            
            let status = "Aman";
            if (isExpired) status = "Kedaluwarsa";
            else if (isMenipis) status = "Menipis";

            return {
                "No": index + 1,
                "Nama Obat": obat.nama_obat,
                "Batch": obat.nama_batch,
                "Jenis": obat.jenis_obat.charAt(0).toUpperCase() + obat.jenis_obat.slice(1),
                "Stok Saat Ini": `${obat.stok_saat_ini} ${obat.satuan}`,
                "Batas Minimum (Reorder)": obat.reorder_level,
                "Tanggal Kedaluwarsa": formatTanggal(obat.expired_date),
                "Status": status
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Obat");
        XLSX.writeFile(workbook, "Data_Stok_Obat_Klinik.xlsx");
    };

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Obat / <span className="text-black font-bold">Kelola Obat</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Daftar Stok Obat</h2>
                    <div className="flex space-x-3">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input 
                                type="text" name="query" defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari obat / batch..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                        
                        {}
                        <button 
                            onClick={handleExportExcel}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            Export
                        </button>
                        
                        <TambahObatButton />
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
                                <th className="px-4 py-3 font-medium text-center">Stok</th>
                                <th className="px-4 py-3 font-medium">Expired Date</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {obatList.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-6 text-gray-400">Stok obat masih kosong.</td></tr>
                            ) : (
                                obatList.map((obat, index) => {
                                    const isExpired = new Date(obat.expired_date) < tanggalHariIni;
                                    const isMenipis = obat.stok_saat_ini <= obat.reorder_level;

                                    return (
                                        <tr key={obat.id_obat} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{obat.nama_obat}</td>
                                            <td className="px-4 py-3">{obat.nama_batch}</td>
                                            <td className="px-4 py-3 capitalize">{obat.jenis_obat}</td>
                                            <td className="px-4 py-3 text-center font-medium">{obat.stok_saat_ini} {obat.satuan}</td>
                                            <td className="px-4 py-3">{formatTanggal(obat.expired_date)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {isExpired ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Kedaluwarsa</span>
                                                : isMenipis ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Menipis</span>
                                                : <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aman</span>}
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
            </div>
        </div>
    );
}