'use client'
import { X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditTenagaMedisButton({ tm }: { tm: any }) {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [kode, setKode] = useState(tm.kode_tenaga_medis);
    const [nama, setNama] = useState(tm.nama_tenaga_medis);
    const [jabatan, setJabatan] = useState(tm.jabatan);
    const [role, setRole] = useState(tm.users?.role || "dokter");
    const [email, setEmail] = useState(tm.users?.email || "");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await fetch('/api/tenaga-medis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_tenaga_medis: tm.id_tenaga_medis, 
                kode_tenaga_medis: kode,
                nama_tenaga_medis: nama,
                jabatan: jabatan,
                role: role,
                email: email,
                password: password 
            })
        });

        if (res.ok) {
            setModalOpen(false);
            router.refresh(); 
        } else {
            alert("Gagal menyimpan perubahan data tenaga medis");
        }
        setIsLoading(false);
    }

    return (
        <>
            <button onClick={() => setModalOpen(true)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                Edit
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-left">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-gray-900">Form Edit Tenaga Medis</span>
                            <X size={22} className="text-gray-600 cursor-pointer hover:text-red-500" onClick={() => setModalOpen(false)}/>
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Kode Tenaga Medis</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={kode} onChange={(e) => setKode(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Nama Lengkap</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={nama} onChange={(e) => setNama(e.target.value)}/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Jabatan / Spesialisasi</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={jabatan} onChange={(e) => setJabatan(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Role Sistem</label>
                                    <select required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400 bg-white" value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="dokter">Dokter</option>
                                        <option value="perawat">Perawat</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Email Akun</label>
                                    <input type="email" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Password <span className="text-xs font-normal text-gray-500">(Kosongkan jika tidak diganti)</span></label>
                                    <input type="password" className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 pt-4 border-t gap-3">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition duration-200">Batal</button>
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