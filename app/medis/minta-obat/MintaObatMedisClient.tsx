"use client";

import { Search } from "lucide-react";
import TambahMintaObatButton from "@/components/ui/TambahMintaObatButton";

interface Obat {
    id_obat: string | number;
    nama_obat: string;
    stok_saat_ini: number;
    satuan: string;
}

interface DetailPermintaan {
    jumlah_diminta: number;
    obat?: {
        nama_obat: string;
    };
}

interface Riwayat {
    id_permintaan: string | number;
    waktu_permintaan: string;
    pegawai?: {
        nama_pegawai: string;
    };
    tenaga_medis?: {
        nama_tenaga_medis: string;
    };
    penyakit?: {
        nama_penyakit: string;
    };
    detail_permintaan?: DetailPermintaan[];
}

type ObatOption = {
  id_obat: number;
  nama_obat: string;
  stok_saat_ini: number;
  satuan: string;
};

type RiwayatPermintaan = {
  id_permintaan: number;
  waktu_permintaan: string;
  pegawai?: { nama_pegawai: string } | null;
  tenaga_medis?: { nama_tenaga_medis: string } | null;
  penyakit?: { nama_penyakit: string } | null;
  detail_permintaan?: DetailPermintaan[];
};

export default function MintaObatMedisClient({
  riwayatList,
  obats,
  query,
}: {
  riwayatList: RiwayatPermintaan[];
  obats: ObatOption[];
  query: string;
}) {
  const formatTanggal = (tanggalString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(tanggalString));
  };

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    {}
                    <h1 className="text-gray-400">Medis / Transaksi / <span className="text-black font-bold">Minta Obat</span></h1>
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
                                placeholder="Cari Pasien..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                        
                        {}
                        <TambahMintaObatButton obats={obats} />
                        
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
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada transaksi.</td></tr>
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
