"use client";

import { Search, Download } from "lucide-react"; 

export default function MintaObatClient({ riwayatList, query }: { riwayatList: any[], query: string }) {
    
    const formatTanggal = (tanggalString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(tanggalString));
    };

    const exportToCSV = () => {
        if (riwayatList.length === 0) {
            alert("Tidak ada data untuk diexport.");
            return;
        }

        const headers = ["No", "Waktu Transaksi", "Pasien", "Pemeriksa", "Diagnosa Penyakit", "Obat Diberikan"];
        const csvRows = riwayatList.map((riwayat, index) => {
            const waktu = formatTanggal(riwayat.waktu_permintaan);
            const pasien = riwayat.pegawai?.nama_pegawai || "-";
            const pemeriksa = riwayat.tenaga_medis?.nama_tenaga_medis || "-";
            const diagnosa = riwayat.penyakit?.nama_penyakit || "-";
            const daftarObat = riwayat.detail_permintaan?.map((d: any) => `${d.obat?.nama_obat} (${d.jumlah_diminta})`).join(", ") || "-";

            return [
                index + 1,
                `"${waktu}"`,
                `"${pasien}"`,
                `"${pemeriksa}"`,
                `"${diagnosa}"`,
                `"${daftarObat}"`
            ].join(",");
        });

        const csvString = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Rekap_Obat_Keluar_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Transaksi / <span className="text-black font-bold">Minta Obat (Log Aktivitas)</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
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
                        
                        {}
                        <button 
                            onClick={exportToCSV}
                            className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors text-sm font-medium"
                        >
                            <Download size={16} /> Export Rekap
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
                            {riwayatList.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada transaksi permintaan obat.</td></tr>
                            ) : (
                                riwayatList.map((riwayat, index) => (
                                    <tr key={riwayat.id_permintaan} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{formatTanggal(riwayat.waktu_permintaan)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{riwayat.pegawai?.nama_pegawai || "-"}</td>
                                        <td className="px-4 py-3">{riwayat.tenaga_medis?.nama_tenaga_medis || "-"}</td>
                                        <td className="px-4 py-3">{riwayat.penyakit?.nama_penyakit || "-"}</td>
                                        <td className="px-4 py-3">
                                            <ul className="list-disc list-inside text-xs text-gray-600">
                                                {riwayat.detail_permintaan?.map((detail: any, i: number) => (
                                                    <li key={i}>{detail.obat?.nama_obat} ({detail.jumlah_diminta})</li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}