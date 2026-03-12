"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";

interface Pegawai {
    nik: string;
    nama_pegawai: string;
    departemen: string;
}

interface PresensiSakit {
    id_presensi: string;
    jam_masuk: string;
    tipe: string;
    pegawai: Pegawai;
}

export default function IstirahatSakitClient({ dataList, query, notifications }: { dataList: PresensiSakit[], query: string, notifications: any[] }) {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const formatTanggal = (tanggalString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(tanggalString));
    };

    const totalPages = Math.ceil(dataList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = dataList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-4 relative">
            
            <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
                <div className="flex flex-col">
                    <h1 className="text-black">Admin / <span className="text-white font-bold">Riwayat Istirahat Sakit</span></h1>
                </div>
                <UserAccount notifications={notifications} userName={session?.user?.name || "Administrator"} />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Data Pasien Istirahat Sakit</h2>
                    <div className="flex space-x-3">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input 
                                type="text" name="query" defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari NIK / Nama / Dept..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">No</th>
                                <th className="px-4 py-3 font-medium">Waktu Tercatat</th>
                                <th className="px-4 py-3 font-medium">NIK Pasien</th>
                                <th className="px-4 py-3 font-medium">Nama Pasien</th>
                                <th className="px-4 py-3 font-medium">Departemen</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {currentData.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada data pasien istirahat sakit yang tercatat.</td></tr>
                            ) : (
                                currentData.map((data, index) => {
                                    const actualNumber = startIndex + index + 1;

                                    return (
                                        <tr key={data.id_presensi} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-600">{actualNumber}</td>
                                            <td className="px-4 py-3 text-gray-800 font-medium">{formatTanggal(data.jam_masuk)}</td>
                                            <td className="px-4 py-3 font-mono text-gray-600">{data.pegawai?.nik || "-"}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{data.pegawai?.nama_pegawai || "-"}</td>
                                            <td className="px-4 py-3 text-gray-600">{data.pegawai?.departemen || "-"}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                    Sakit
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {dataList.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <span className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, dataList.length)}</span> dari <span className="font-semibold text-gray-900">{dataList.length}</span> data
                        </span>
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <span className="text-sm font-medium text-gray-700 px-4">
                                Halaman {currentPage} / {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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