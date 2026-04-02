"use client";

import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";

// IMPORT NEXT-AUTH DAN USER ACCOUNT
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";

interface ObatDetail {
    obat?: { nama_obat: string };
    jumlah_diminta: number;
}

interface RiwayatPermintaan {
    id_permintaan: number;
    waktu_permintaan: string;
    pegawai?: { nama_pegawai: string };
    tenaga_medis?: { nama_tenaga_medis: string };
    penyakit?: { nama_penyakit: string };
    detail_permintaan?: ObatDetail[];
}

type Notification = {
    id_obat: string;
    obat: { nama_obat: string } | null;
    pesan: string;
    status: string;
};

export default function MintaObatClient({ 
    riwayatList, 
    query,
    notifications
}: { 
    riwayatList: RiwayatPermintaan[], 
    query: string,
    notifications: Notification[]
}) {
    // --- MENGAMBIL DATA SESSION USER ---
    const { data: session } = useSession();

    // --- STATE UNTUK PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const formatTanggal = (tanggalString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(tanggalString));
    };

    const exportToExcel = async () => {
        if (riwayatList.length === 0) {
            alert("Tidak ada data untuk diexport.");
            return;
        }

        try {
            const XLSX = await import("xlsx");
            const excelData = riwayatList.map((riwayat, index) => {
                const waktu = formatTanggal(riwayat.waktu_permintaan);
                const pasien = riwayat.pegawai?.nama_pegawai || "-";
                const pemeriksa = riwayat.tenaga_medis?.nama_tenaga_medis || "-";
                const diagnosa = riwayat.penyakit?.nama_penyakit || "-";
                const daftarObat = riwayat.detail_permintaan?.map((d) => `${d.obat?.nama_obat} (${d.jumlah_diminta})`).join(", ") || "-";

                return {
                    "No": index + 1,
                    "Waktu Transaksi": waktu,
                    "Pasien": pasien,
                    "Pemeriksa": pemeriksa,
                    "Diagnosa Penyakit": diagnosa,
                    "Obat Diberikan": daftarObat
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Obat Keluar");
            XLSX.writeFile(workbook, `Rekap_Obat_Keluar_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Error exporting Excel:", error);
            alert("Gagal mengexport file Excel");
        }
    };

    // --- LOGIKA PEMOTONGAN DATA (PAGINATION) ---
    const totalPages = Math.ceil(riwayatList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = riwayatList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-4 relative">
            
            {/* ========================================= */}
            {/* HEADER: USER ACCOUNT DI KANAN ATAS          */}
            {/* ========================================= */}
            <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-lg leading-none">Log Aktivitas Obat</span>
                </div>
                <UserAccount notifications={notifications} userName={session?.user?.name || "Admin"} />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Riwayat Permintaan Obat</h2>
                    <div className="flex space-x-3">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input 
                                type="text" name="query" defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari Pasien / Dokter..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                        
                        <button 
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors"
                        >
                            <Download size={16} /> Export Excel
                        </button>
                        
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">No</th>
                                <th className="px-4 py-3 font-medium">Waktu Transaksi</th>
                                <th className="px-4 py-3 font-medium">Pasien</th>
                                <th className="px-4 py-3 font-medium">Pemeriksa</th>
                                <th className="px-4 py-3 font-medium">Diagnosa Penyakit</th>
                                <th className="px-4 py-3 font-medium">Obat Diberikan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {/* Menggunakan currentData yang sudah dipotong 5 baris */}
                            {currentData.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada transaksi permintaan obat.</td></tr>
                            ) : (
                                currentData.map((riwayat, index) => {
                                    // Hitung nomor urut asli sesuai keseluruhan data
                                    const actualNumber = startIndex + index + 1;
                                    
                                    return (
                                        <tr key={riwayat.id_permintaan} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{actualNumber}</td>
                                            <td className="px-4 py-3">{formatTanggal(riwayat.waktu_permintaan)}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{riwayat.pegawai?.nama_pegawai || "-"}</td>
                                            <td className="px-4 py-3">{riwayat.tenaga_medis?.nama_tenaga_medis || "-"}</td>
                                            <td className="px-4 py-3">{riwayat.penyakit?.nama_penyakit || "-"}</td>
                                            <td className="px-4 py-3">
                                                <ul className="list-disc list-inside text-xs text-gray-600">
                                                    {riwayat.detail_permintaan?.map((detail, i) => (
                                                        <li key={i}>{detail.obat?.nama_obat} ({detail.jumlah_diminta})</li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {}
                {}
                {}
                {riwayatList.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <span className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, riwayatList.length)}</span> dari <span className="font-semibold text-gray-900">{riwayatList.length}</span> data
                        </span>
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <span className="text-sm font-bold text-gray-700 px-4">
                                Halaman {currentPage} / {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
}
