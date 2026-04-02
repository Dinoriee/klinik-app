"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

type Notification = {
    id_obat: string;
    obat: { nama_obat: string } | null;
    pesan: string;
    status: string;
};

const formatTanggal = (tanggalString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(new Date(tanggalString));
};

function IstirahatSakitTable({ dataList }: { dataList: PresensiSakit[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(dataList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = dataList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
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

                        <span className="text-sm font-bold text-gray-700 px-4">
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
        </>
    );
}

export default function IstirahatSakitClient({ dataList, query, notifications }: { dataList: PresensiSakit[], query: string, notifications: Notification[] }) {
    const { data: session } = useSession();
    const router = useRouter();

    const dataVersion = useMemo(() => {
        const firstId = dataList[0]?.id_presensi ?? "";
        return `${query}|${dataList.length}|${firstId}`;
    }, [dataList, query]);

    const handleExportExcel = async () => {
        if (dataList.length === 0) return alert("Tidak ada data untuk diexport!");

        try {
            const XLSX = await import("xlsx");
            const dataToExport = dataList.map((data, index) => ({
                "No": index + 1,
                "Waktu Tercatat": formatTanggal(data.jam_masuk),
                "NIK Pasien": data.pegawai?.nik || "-",
                "Nama Pasien": data.pegawai?.nama_pegawai || "-",
                "Departemen": data.pegawai?.departemen || "-",
                "Status": "Sakit",
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Istirahat Sakit");
            XLSX.writeFile(workbook, `Rekap_Istirahat_Sakit_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Error exporting Excel:", error);
            alert("Gagal mengexport file Excel");
        }
    };

    useEffect(() => {
        const refresh = () => router.refresh();

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") refresh();
        };

        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", onVisibilityChange);

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") refresh();
        }, 5000);

        return () => {
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.clearInterval(intervalId);
        };
    }, [router]);

    return (
        <div className="flex flex-col gap-4 relative">
            
            <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-lg leading-none">Riwayat Istirahat Sakit</span>
                </div>
                <UserAccount notifications={notifications} userName={session?.user?.name || "Admin"} />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Data Pasien Istirahat Sakit</h2>
                    <div className="flex space-x-8 gap-2">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input 
                                type="text" name="query" defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari NIK / Nama / Dept..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    void handleExportExcel();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors ml-2"
                            >
                                <Download size={16} /> Export Excel
                            </button>
                        </form>
                        <button
                            type="button"
                            onClick={() => router.refresh()}
                            className="px-4 py-2 border rounded-md border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <IstirahatSakitTable key={dataVersion} dataList={dataList} />
                
            </div>
        </div>
    );
}
