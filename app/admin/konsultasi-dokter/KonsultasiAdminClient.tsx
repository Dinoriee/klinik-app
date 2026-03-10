"use client";

import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import * as XLSX from "xlsx";
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";

interface RekamMedis {
    id_rekam_medis: string;
    tanggal_periksa: string;
    keluhan: string;
    tensi: string | null;
    suhu: number | null;
    diagnosa: string;
    tindakan: string | null;
    status_perawatan: string;
    pegawai: { nama_pegawai: string; nik: string };
    tenaga_medis: { nama_tenaga_medis: string };
}

export default function KonsultasiAdminClient({ rekamList, query }: { rekamList: RekamMedis[], query: string }) {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRekam, setSelectedRekam] = useState<RekamMedis | null>(null);
    const itemsPerPage = 5;

    const formatTanggal = (tanggalString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(tanggalString));
    };

    const handleExportExcel = () => {
        if (rekamList.length === 0) return alert("Tidak ada data untuk diexport!");

        const dataToExport = rekamList.map((rekam, index) => {
            return {
                "No": index + 1,
                "Tanggal Periksa": formatTanggal(rekam.tanggal_periksa),
                "Nama Pasien": rekam.pegawai?.nama_pegawai || "-",
                "NIK Pasien": rekam.pegawai?.nik || "-",
                "Dokter Pemeriksa": rekam.tenaga_medis?.nama_tenaga_medis || "-",
                "Keluhan": rekam.keluhan,
                "Tekanan Darah": rekam.tensi || "-",
                "Suhu Tubuh": rekam.suhu ? `${rekam.suhu}°C` : "-",
                "Diagnosa": rekam.diagnosa,
                "Tindakan / Resep": rekam.tindakan || "-",
                "Status Perawatan": rekam.status_perawatan === "rawat_inap" ? "Rawat Inap" : "Rawat Jalan"
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Rekam Medis");
        XLSX.writeFile(workbook, `Rekap_Rekam_Medis_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const totalPages = Math.ceil(rekamList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = rekamList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-4 relative">
            
            <div className="flex justify-between items-center p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Admin / <span className="text-black font-bold">Riwayat Konsultasi (Rekam Medis)</span></h1>
                </div>
                <UserAccount userName={session?.user?.name || "Admin"} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Data Riwayat Konsultasi</h2>
                    <div className="flex space-x-3">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input 
                                type="text" name="query" defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari Pasien/Dokter/Diagnosa..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                        
                        <button 
                            onClick={handleExportExcel}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Download size={16} /> Export Excel
                        </button>
                    </div>
                </div>

                {rekamList.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-2">Belum ada riwayat rekam medis</p>
                        <p className="text-xs text-gray-500">Data akan muncul di sini setelah dokter menyimpan konsultasi dari bagian Medis</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-y text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">No</th>
                                        <th className="px-4 py-3 font-medium">Tanggal</th>
                                        <th className="px-4 py-3 font-medium">Pasien</th>
                                        <th className="px-4 py-3 font-medium">Dokter</th>
                                        <th className="px-4 py-3 font-medium">Keluhan & Diagnosa</th>
                                        <th className="px-4 py-3 font-medium text-center">Status</th>
                                        <th className="px-4 py-3 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {currentData.map((rekam, index) => {
                                        const actualNumber = startIndex + index + 1;
                                        const isRawatInap = rekam.status_perawatan === "rawat_inap";

                                        return (
                                            <tr key={rekam.id_rekam_medis} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{actualNumber}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{formatTanggal(rekam.tanggal_periksa)}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{rekam.pegawai?.nama_pegawai || "-"}</td>
                                                <td className="px-4 py-3">{rekam.tenaga_medis?.nama_tenaga_medis || "-"}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">Keluhan: {rekam.keluhan}</span>
                                                        <span className="font-medium text-blue-700">Dx: {rekam.diagnosa}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isRawatInap ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {isRawatInap ? 'Rawat Inap' : 'Rawat Jalan'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedRekam(rekam)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {rekamList.length > 0 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <span className="text-sm text-gray-500">
                                    Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, rekamList.length)}</span> dari <span className="font-semibold text-gray-900">{rekamList.length}</span> data
                                </span>
                                
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    <span className="text-sm font-medium text-gray-700 px-4">
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
                    </>
                )}
                
            </div>

            {selectedRekam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Detail Rekam Medis</h3>
                            <button
                                onClick={() => setSelectedRekam(null)}
                                className="p-1 hover:bg-blue-500 rounded-md transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informasi Pasien & Dokter */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Pasien</p>
                                    <p className="text-lg font-bold text-gray-800">{selectedRekam.pegawai?.nama_pegawai}</p>
                                    <p className="text-sm text-gray-600">NIK: {selectedRekam.pegawai?.nik}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-600 uppercase font-bold tracking-wider">Dokter Pemeriksa</p>
                                    <p className="text-lg font-bold text-gray-800">{selectedRekam.tenaga_medis?.nama_tenaga_medis}</p>
                                    <p className="text-sm text-gray-600">
                                        {formatTanggal(selectedRekam.tanggal_periksa)}
                                    </p>
                                </div>
                            </div>

                            {/* Data Medis */}
                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-800 mb-4">Data Pemeriksaan Medis</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Keluhan Utama</p>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{selectedRekam.keluhan}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Diagnosa</p>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md font-medium text-blue-700">{selectedRekam.diagnosa}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tekanan Darah (mmHg)</p>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{selectedRekam.tensi || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Suhu Tubuh (°C)</p>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{selectedRekam.suhu ? selectedRekam.suhu.toFixed(1) : "-"}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tindakan / Pemberian Obat</p>
                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{selectedRekam.tindakan || "(Tidak ada tindakan/resep)"}</p>
                                </div>
                            </div>

                            {/* Status Perawatan */}
                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Status Perawatan</p>
                                <div className="inline-block">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                        selectedRekam.status_perawatan === "rawat_inap" 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {selectedRekam.status_perawatan === "rawat_inap" ? "Rawat Inap" : "Rawat Jalan"}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="border-t pt-4 flex gap-2">
                                <button
                                    onClick={() => setSelectedRekam(null)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-md transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}