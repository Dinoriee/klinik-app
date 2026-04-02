'use client'
import { X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Barcode from 'react-barcode';

export default function TambahTenagaMedisButton() {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [kode, setKode] = useState("");
    const [nama, setNama] = useState("");
    const [jabatan, setJabatan] = useState("");
    const [role, setRole] = useState("dokter");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nik, setNik] = useState(""); 
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/tenaga-medis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kode_tenaga_medis: kode,
                    nama_tenaga_medis: nama,
                    jabatan: jabatan,
                    role: role,
                    email: email,
                    password: password,
                    nik: nik 
                })
            });

            const result = await res.json();

            if (res.ok) {
                setIsSuccess(true);
               
                setKode(""); setNama(""); setJabatan(""); setRole("dokter"); setEmail(""); setPassword("");
                router.refresh(); 
                alert("Berhasil menyimpan data tenaga medis!");
            } else {
                
                alert(result.message || "Gagal menyimpan data tenaga medis");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan pada jaringan/server.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <button 
                onClick={() => setModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-white"
            >
                + Tambah Data
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-2xl">
                        {!isSuccess ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg text-gray-900">Form Tambah Tenaga Medis</span>
                            <X size={22} className="text-gray-600 cursor-pointer hover:text-red-500" onClick={() => setModalOpen(false)}/>
                        </div>

                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            {}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Kode Tenaga Medis</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={kode} onChange={(e) => setKode(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">NIK (Nomor Induk Kependudukan)</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="Masukkan 6 digit NIK..." maxLength={6}/>
                                </div>
                            </div>

                            {}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Nama Lengkap</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={nama} onChange={(e) => setNama(e.target.value)}/>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Jabatan / Spesialisasi</label>
                                    <input type="text" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={jabatan} onChange={(e) => setJabatan(e.target.value)}/>
                                </div>
                            </div>

                            {}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Role Sistem</label>
                                    <select required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400 bg-white" value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="dokter">Dokter</option>
                                        <option value="perawat">Perawat</option>
                                    </select>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Email Akun</label>
                                    <input type="email" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                </div>
                            </div>
                            
                            {}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-800">Password Akun</label>
                                    <input type="password" required className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 pt-4 border-t gap-3">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition duration-200">Batal</button>
                                <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md transition duration-200 disabled:opacity-50">
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                            </>
                        ): (
                            <div className="flex flex-col items-center py-8 animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-green-600 mb-2">BERHASIL DISIMPAN!</h2>
            <p className="text-gray-500 mb-6">Barcode Tenaga Medis</p>
            
            <div className="bg-white p-4 border-2 border-dashed border-blue-400 rounded-lg shadow-inner">
                <Barcode 
                    value={nik} 
                    format="CODE128" 
                    width={1.8} 
                    height={70} 
                    fontSize={16}
                />
            </div>

            <div className="mt-8 flex gap-3">
                <button 
                    onClick={() => window.print()} 
                    className="bg-gray-800 text-white px-6 py-2 rounded-md font-bold hover:bg-black transition-all"
                >
                    CETAK BARCODE
                </button>
                <button 
                    onClick={() => {
                        setModalOpen(false);
                        setIsSuccess(false);
                        setNik(""); setNama("");
                    }} 
                    className="bg-blue-500 text-white px-6 py-2 rounded-md font-bold"
                >
                    SELESAI
                </button>
            </div>
        </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}