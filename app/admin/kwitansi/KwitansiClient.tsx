"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Receipt, X, Download } from "lucide-react";
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface KwitansiData {
    id_kwitansi: string;
    id_rekam_medis: string;
    total_biaya: number | null;
    status: "belum_lunas" | "lunas";
    tanggal_terbit: string;
    tanggal_lunas: string | null;
    rekam_medis: {
        id_rekam_medis: string;
        keluhan: string;
        diagnosa: string;
        tanggal_periksa: string;
        pegawai: {
            id_pegawai: string;
            nama_pegawai: string;
            nomor_pegawai: string;
        };
        tenaga_medis: {
            id_tenaga_medis: string;
            nama_tenaga_medis: string;
        };
    };
}

export default function KwitansiClient({
    kwitansiList,
    query,
    status: statusFilter,
}: {
    kwitansiList: KwitansiData[];
    query: string;
    status: string;
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedKwitansi, setSelectedKwitansi] = useState<KwitansiData | null>(null);
    const itemsPerPage = 5;

    const formatTanggal = (tanggalString: string) => {
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(tanggalString));
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) return "Belum ditentukan";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(value);
    };

    const handleDetailClick = (kwitansi: KwitansiData) => {
        setSelectedKwitansi(kwitansi);
        setDetailModalOpen(true);
    };

    const handleExportExcel = async () => {
        try {
            const XLSX = await import("xlsx");
            const dataToExport = kwitansiList.map((kwitansi, index) => {
                return {
                    "No": index + 1,
                    "No Kwitansi": kwitansi.id_kwitansi.slice(-8).toUpperCase(),
                    "Nama Pasien": kwitansi.rekam_medis.pegawai.nama_pegawai,
                    "Nomor Pasien": kwitansi.rekam_medis.pegawai.nomor_pegawai,
                    "Dokter": kwitansi.rekam_medis.tenaga_medis.nama_tenaga_medis,
                    "Total Biaya": kwitansi.total_biaya || 0,
                    "Status": kwitansi.status === "lunas" ? "Lunas" : "Belum Lunas",
                    "Tanggal Terbit": new Date(kwitansi.tanggal_terbit).toLocaleDateString("id-ID"),
                    "Tanggal Lunas": kwitansi.tanggal_lunas ? new Date(kwitansi.tanggal_lunas).toLocaleDateString("id-ID") : "-",
                };
            });
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Kwitansi");
            XLSX.writeFile(workbook, "Data_Kwitansi_Klinik.xlsx");
        } catch (error) {
            console.error("Error exporting Excel:", error);
        }
    };

    const totalPages = Math.ceil(kwitansiList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = kwitansiList.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between items-center p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">
                        Klinik / Kasir / <span className="text-black font-bold">Kwitansi</span>
                    </h1>
                </div>
                <UserAccount userName={session?.user?.name || "Admin"} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Data Kwitansi</h2>
                    <div className="flex space-x-3">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                name="query"
                                defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Cari nama pasien..."
                                suppressHydrationWarning
                            />
                            <button type="submit" className="hidden">
                                Cari
                            </button>
                        </form>

                        <select
                            name="status"
                            defaultValue={statusFilter}
                            onChange={(e) => {
                                const params = new URLSearchParams();
                                if (query) params.set("query", query);
                                if (e.target.value) params.set("status", e.target.value);
                                router.push(`?${params.toString()}`);
                            }}
                            className="px-3 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            suppressHydrationWarning
                        >
                            <option value="">Semua Status</option>
                            <option value="belum_lunas">Belum Lunas</option>
                            <option value="lunas">Lunas</option>
                        </select>

                        <button
                            onClick={handleExportExcel}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                            suppressHydrationWarning
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">No</th>
                                <th className="px-4 py-3 font-medium">No Kwitansi</th>
                                <th className="px-4 py-3 font-medium">Nama Pasien</th>
                                <th className="px-4 py-3 font-medium">Dokter</th>
                                <th className="px-4 py-3 font-medium">Total Biaya</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Tanggal Terbit</th>
                                <th className="px-4 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" suppressHydrationWarning>
                            {currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-400">
                                        Tidak ada data kwitansi.
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((kwitansi, index) => (
                                    <tr key={kwitansi.id_kwitansi} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{startIndex + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {kwitansi.id_kwitansi.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-3">{kwitansi.rekam_medis.pegawai.nama_pegawai}</td>
                                        <td className="px-4 py-3">{kwitansi.rekam_medis.tenaga_medis.nama_tenaga_medis}</td>
                                        <td className="px-4 py-3" suppressHydrationWarning>{formatCurrency(kwitansi.total_biaya)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    kwitansi.status === "lunas"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {kwitansi.status === "lunas" ? "Lunas" : "Belum Lunas"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs">{formatTanggal(kwitansi.tanggal_terbit)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDetailClick(kwitansi)}
                                                className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded-md transition"
                                                title="Lihat Detail"
                                                suppressHydrationWarning
                                            >
                                                <Receipt size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {kwitansiList.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <span className="text-sm text-gray-500">
                            Menampilkan{" "}
                            <span className="font-semibold text-gray-900">{startIndex + 1}</span> -{" "}
                            <span className="font-semibold text-gray-900">
                                {Math.min(startIndex + itemsPerPage, kwitansiList.length)}
                            </span>{" "}
                            dari <span className="font-semibold text-gray-900">{kwitansiList.length}</span> data
                        </span>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                suppressHydrationWarning
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
                                suppressHydrationWarning
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedKwitansi && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Detail Kwitansi</h3>
                            <button
                                onClick={() => setDetailModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-md transition"
                                suppressHydrationWarning
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">No Kwitansi</label>
                                    <p className="text-gray-600 mt-1">
                                        {selectedKwitansi.id_kwitansi.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Status</label>
                                    <p className="text-gray-600 mt-1">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                selectedKwitansi.status === "lunas"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {selectedKwitansi.status === "lunas" ? "Lunas" : "Belum Lunas"}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Nama Pasien</label>
                                    <p className="text-gray-600 mt-1">{selectedKwitansi.rekam_medis.pegawai.nama_pegawai}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Nomor Pasien</label>
                                    <p className="text-gray-600 mt-1">{selectedKwitansi.rekam_medis.pegawai.nomor_pegawai}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Dokter</label>
                                    <p className="text-gray-600 mt-1">{selectedKwitansi.rekam_medis.tenaga_medis.nama_tenaga_medis}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Total Biaya</label>
                                    <p className="text-gray-600 mt-1 font-semibold">
                                        {formatCurrency(selectedKwitansi.total_biaya)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800">Keluhan</label>
                                <p className="text-gray-600 mt-1">{selectedKwitansi.rekam_medis.keluhan}</p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800">Diagnosa</label>
                                <p className="text-gray-600 mt-1">{selectedKwitansi.rekam_medis.diagnosa}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Tanggal Periksa</label>
                                    <p className="text-gray-600 mt-1 text-xs">{formatTanggal(selectedKwitansi.rekam_medis.tanggal_periksa)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Tanggal Terbit Kwitansi</label>
                                    <p className="text-gray-600 mt-1 text-xs">{formatTanggal(selectedKwitansi.tanggal_terbit)}</p>
                                </div>
                            </div>

                            {selectedKwitansi.tanggal_lunas && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Tanggal Pembayaran</label>
                                    <p className="text-gray-600 mt-1 text-xs">{formatTanggal(selectedKwitansi.tanggal_lunas)}</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    onClick={() => setDetailModalOpen(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition"
                                    suppressHydrationWarning
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
