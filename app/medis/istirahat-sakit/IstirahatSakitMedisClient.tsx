"use client";

import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react"; // PERUBAHAN: Tambahkan useRef
import ScannerIstirahatSakit from "@/components/ui/ScannerIstirahatSakit";
import { toast } from "sonner";

export default function IstirahatSakitMedisClient({ notifications }: { notifications: any[] }) {
    const { data: session } = useSession();
    const [manualNik, setManualNik] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // PERUBAHAN: Membuat referensi untuk kolom input manual
    const inputRef = useRef<HTMLInputElement>(null);

    const prosesDataSakit = async (dataInput: string) => {
        if (!dataInput) {
            toast.error("Data tidak boleh kosong!");
            return;
        }

        setIsLoading(true);
        try {
            let parsedNik = dataInput;
            try {
                const parsed = JSON.parse(dataInput);
                parsedNik = parsed.id || parsed.nik || dataInput; 
            } catch (e) {
                // Biarkan teks mentah
            }

            const res = await fetch('/api/tenaga-medis/istirahat-sakit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nik_pegawai: parsedNik, status: "sakit" })
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(result.message || "Berhasil mencatat pasien istirahat sakit!");
                setManualNik("");
            } else {
                toast.error(result.message || "Gagal menyimpan data.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem/jaringan.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col relative">
            
            <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
                <div className="flex flex-col">
                    <span className="text-gray-100 font-bold text-lg leading-none">Istirahat Sakit</span>
                </div>
                <div className="flex space-x-1">
                    <UserAccount notifications={notifications} userName={session?.user?.name || "Medis"} />
                </div>
            </div>

            <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md m-4">
                 
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="font-bold text-gray-800 text-lg">Pengajuan Istirahat Sakit</h2>
                </div>

                <div className="mt-4 mb-8">
                    <ScannerIstirahatSakit onScanSuccess={prosesDataSakit} />
                </div>

                <h3 className="text-2xl font-bold text-black mb-4">Input Manual</h3>
                <div className="flex gap-4 max-w-md">
                    {/* PERUBAHAN: Menempelkan ref ke elemen input */}
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Cari NIK..." 
                        className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        value={manualNik}
                        onChange={(e) => setManualNik(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && prosesDataSakit(manualNik)}
                    />
                    <button 
                        onClick={() => prosesDataSakit(manualNik)}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-md font-medium transition duration-200 disabled:opacity-50"
                    >
                        {isLoading ? "Proses..." : "Simpan"}
                    </button>
                </div>
                
            </div>
            
        </div>
    );
}
