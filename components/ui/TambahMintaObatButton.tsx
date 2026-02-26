'use client'
import { X, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Obat {
    id_obat: string | number;
    nama_obat: string;
    stok_saat_ini: number;
    satuan: string;
}

export default function TambahMintaObatButton({ obats }: { obats: Obat[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [barisObat, setBarisObat] = useState([{ id: Date.now() }]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const openModal = () => {
        setBarisObat([{ id: Date.now() }]);
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const tambahBaris = () => {
        setBarisObat([...barisObat, { id: Date.now() }]);
    };

    const hapusBaris = (id: number) => {
        if (barisObat.length > 1) {
            setBarisObat(barisObat.filter(b => b.id !== id));
        }
    };

    const handleSimpan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        const form = new FormData(e.currentTarget);
        const idObats = form.getAll("id_obat");
        const jumlahs = form.getAll("jumlah");

        try {
            const res = await fetch("/api/minta-obat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_obat: idObats, jumlah: jumlahs }),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                closeModal();
                router.refresh();
            } else {
                setErrorMessage(result.message || "Terjadi kesalahan.");
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Gagal menghubungi server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button 
                onClick={openModal}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-white"
            >
                + Buat Permintaan
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-md shadow-lg w-full max-w-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b shrink-0">
                            <span className="font-bold text-lg text-gray-900">Form Pengeluaran Stok Obat</span>
                            <X size={22} className="text-gray-600 cursor-pointer hover:text-red-500" onClick={closeModal}/>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {errorMessage && (
                                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-sm font-medium">
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSimpan} className="flex flex-col gap-6" id="form-transaksi">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-gray-800">Daftar Obat yang Diambil</h3>
                                        <button type="button" onClick={tambahBaris} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 font-bold transition-colors">
                                            <Plus size={14} /> Tambah Obat Lain
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {barisObat.map((baris, index) => (
                                            <div key={baris.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-md border border-gray-200">
                                                <div className="flex-1 flex flex-col space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-800">Pilih Obat {index + 1}</label>
                                                    <select name="id_obat" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400 bg-white">
                                                        <option value="">-- Pilih Obat --</option>
                                                        {}
                                                        {obats.map((o: Obat) => (
                                                            <option key={o.id_obat} value={o.id_obat}>
                                                                {o.nama_obat} (Sisa Stok: {o.stok_saat_ini} {o.satuan})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-32 flex flex-col space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-800">Jumlah</label>
                                                    <input type="number" name="jumlah" min="1" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" placeholder="Cth: 2" />
                                                </div>

                                                {barisObat.length > 1 && (
                                                    <button type="button" onClick={() => hapusBaris(baris.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 rounded-md border border-red-100 transition-colors" title="Hapus baris ini">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="flex justify-end gap-3 p-6 border-t shrink-0">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition duration-200">Batal</button>
                            <button type="submit" form="form-transaksi" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md transition duration-200 disabled:opacity-50">
                                {isLoading ? "Menyimpan..." : "Simpan & Kurangi Stok"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}