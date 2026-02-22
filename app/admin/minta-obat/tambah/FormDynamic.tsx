"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

export default function FormDynamic({ obats, actionSimpan, errorMessage }: { obats: any[], actionSimpan: any, errorMessage?: string }) {
    // State untuk menyimpan daftar baris input (dimulai dengan 1 baris)
    const [barisObat, setBarisObat] = useState([{ id: Date.now() }]);

    const tambahBaris = () => {
        setBarisObat([...barisObat, { id: Date.now() }]);
    };

    const hapusBaris = (id: number) => {
        if (barisObat.length > 1) {
            setBarisObat(barisObat.filter(b => b.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
            <h2 className="font-bold text-lg mb-6 text-black border-b pb-4">Form Pengeluaran Stok Obat</h2>

            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-sm font-medium">
                    ⚠️ {errorMessage}
                </div>
            )}

            {/* Form ini akan menjalankan server action `actionSimpan` saat di-submit */}
            <form action={actionSimpan} className="flex flex-col gap-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-semibold text-gray-800">Daftar Obat yang Diambil</h3>
                        <button type="button" onClick={tambahBaris} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 font-medium transition-colors">
                            <Plus size={16} /> Tambah Obat Lain
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {barisObat.map((baris, index) => (
                            <div key={baris.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Pilih Obat {index + 1}</label>
                                    <select name="id_obat" required className="border p-2.5 rounded-md focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                                        <option value="">-- Pilih Obat --</option>
                                        {obats.map((o: any) => (
                                            <option key={o.id_obat} value={o.id_obat}>
                                                {o.nama_obat} (Sisa Stok: {o.stok_saat_ini} {o.satuan})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-32 flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">Jumlah</label>
                                    <input type="number" name="jumlah" min="1" required className="border p-2.5 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Cth: 2" />
                                </div>

                                {/* Tombol hapus baris */}
                                {barisObat.length > 1 && (
                                    <button type="button" onClick={() => hapusBaris(baris.id)} className="text-red-500 hover:text-red-700 p-2.5 bg-red-50 hover:bg-red-100 rounded-md border border-red-100 transition-colors" title="Hapus baris ini">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <Link href="/admin/minta-obat" className="px-6 py-3 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                        Batal
                    </Link>
                    <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium shadow-sm">
                        Simpan & Kurangi Stok
                    </button>
                </div>
            </form>
        </div>
    );
}