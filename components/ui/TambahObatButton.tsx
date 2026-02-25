'use client'
import { X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahObatButton() {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State untuk form obat
    const [namaObat, setNamaObat] = useState("");
    const [namaBatch, setNamaBatch] = useState("");
    const [jenisObat, setJenisObat] = useState("tablet");
    const [satuan, setSatuan] = useState("");
    const [stok, setStok] = useState("");
    const [reorderLevel, setReorderLevel] = useState("");
    const [expiredDate, setExpiredDate] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await fetch('/api/obat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama_obat: namaObat,
                nama_batch: namaBatch,
                jenis_obat: jenisObat,
                satuan: satuan,
                stok_saat_ini: stok,
                reorder_level: reorderLevel,
                expired_date: expiredDate
            })
        });

        if (res.ok) {
            setModalOpen(false);
            // Reset form
            setNamaObat(""); setNamaBatch(""); setSatuan(""); setStok(""); setReorderLevel(""); setExpiredDate("");
            router.refresh(); // Refresh data tabel
        } else {
            console.log("Data gagal disimpan");
            alert("Gagal menyimpan data obat");
        }
        setIsLoading(false);
    }

    return (
        <>
            <button 
                onClick={() => setModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-white"
            >
                + Tambah Obat
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-gray-900">Form Tambah Obat</span>
                            <X size={22} className="text-gray-600 cursor-pointer hover:text-red-500" onClick={() => setModalOpen(false)}/>
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Nama Obat</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={namaObat} onChange={(e) => setNamaObat(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Nomor Batch</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={namaBatch} onChange={(e) => setNamaBatch(e.target.value)}/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Jenis Obat</label>
                                    {/* Ini bentuk dropdown versi Dino */}
                                    <select required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400 bg-white" value={jenisObat} onChange={(e) => setJenisObat(e.target.value)}>
                                        <option value="tablet">Tablet</option>
                                        <option value="kapsul">Kapsul</option>
                                        <option value="sirup">Sirup</option>
                                        <option value="salep">Salep</option>
                                        <option value="injeksi">Injeksi</option>
                                    </select>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Satuan</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" placeholder="Cth: Strip, Botol" value={satuan} onChange={(e) => setSatuan(e.target.value)}/>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Stok Awal</label>
                                    <input type="number" required min="0" className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={stok} onChange={(e) => setStok(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Batas Min (Reorder)</label>
                                    <input type="number" required min="0" className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Expired Date</label>
                                    <input type="date" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400 bg-white" value={expiredDate} onChange={(e) => setExpiredDate(e.target.value)}/>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 pt-4 border-t gap-3">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition duration-200">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md transition duration-200 disabled:opacity-50">
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}