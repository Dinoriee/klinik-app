'use client'
import { X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditObatButton({ obat }: { obat: any }) {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State diisi langsung dengan data obat yang mau diedit
    const [namaObat, setNamaObat] = useState(obat.nama_obat);
    const [namaBatch, setNamaBatch] = useState(obat.nama_batch);
    const [jenisObat, setJenisObat] = useState(obat.jenis_obat);
    const [satuan, setSatuan] = useState(obat.satuan);
    const [stok, setStok] = useState(obat.stok_saat_ini);
    const [reorderLevel, setReorderLevel] = useState(obat.reorder_level);
    // Potong tanggal ISO agar pas dengan format kalender
    const [expiredDate, setExpiredDate] = useState(obat.expired_date.split("T")[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await fetch('/api/obat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_obat: obat.id_obat, // PENTING: Kirim ID supaya API tahu ini proses Edit
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
            router.refresh(); 
        } else {
            alert("Gagal menyimpan perubahan data obat");
        }
        setIsLoading(false);
    }

    return (
        <>
            <button 
                onClick={() => setModalOpen(true)}
                className="text-blue-500 hover:text-blue-700 text-xs font-medium"
            >
                Edit
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-left">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-gray-900">Form Edit Obat</span>
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
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={satuan} onChange={(e) => setSatuan(e.target.value)}/>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Stok</label>
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
                                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}