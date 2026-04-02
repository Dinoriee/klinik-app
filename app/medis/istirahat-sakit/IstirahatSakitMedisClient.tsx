"use client";

import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ScannerIstirahatSakit from "@/components/ui/ScannerIstirahatSakit";
import { toast } from "sonner";

export default function IstirahatSakitMedisClient({ notifications }: { notifications: any[] }) {
    const { data: session } = useSession();
    const [manualNik, setManualNik] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="flex flex-col gap-4 relative">
            
            <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
                <div className="flex flex-col">
                    <h1 className="text-black">Klinik / <span className="text-whote font-bold">Istirahat Sakit</span></h1>
                </div>
                <UserAccount notifications={notifications} userName={session?.user?.name || "Pegawai Medis"} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                
                <div className="mb-4">
                    <h2 className="font-bold text-gray-800 text-lg">Istirahat Sakit Scanner</h2>
                </div>

                <div className="mb-8">
                    <ScannerIstirahatSakit onScanSuccess={prosesDataSakit} />
                </div>

                <h3 className="font-bold text-lg text-black mb-4">Istirahat Sakit Manual</h3>
                <div className="flex gap-4 max-w-md">
                    <input 
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
