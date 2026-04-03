"use client";

import { useState, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Barcode as BarcodeIcon, Printer, X } from "lucide-react";
import TambahTenagaMedisButton from "@/components/ui/TambahTenagaMedisButton";
import EditTenagaMedisButton from "@/components/ui/EditTenagaMedisButton";
import DeleteTenagaMedisButton from "@/components/ui/DeleteTenagaMedisButton";
import UserAccount from "@/components/ui/userAccount";
import { useSession } from "next-auth/react";
import Barcode from "react-barcode";

interface TenagaMedis {
    id_tenaga_medis: number | string;
    kode_tenaga_medis: string;
    nama_tenaga_medis: string;
    jabatan: string;
    nik: string;
    users?: {
        email: string;
        role: string;
    } | null;
}

type Notification = {
    id_obat: string;
    obat: { nama_obat: string } | null;
    pesan: string;
    status: string;
};

export default function TenagaMedisClient({ tenagaMedisList, query, notifications }: { tenagaMedisList: TenagaMedis[], query: string, notifications: Notification[] }) {
    
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const handleExportExcel = async () => {
        try {
            const XLSX = await import("xlsx");
            const dataToExport = tenagaMedisList.map((tm, index) => {
                const roleFormatted = tm.users?.role ? tm.users.role.charAt(0).toUpperCase() + tm.users.role.slice(1) : "-";
                
                return {
                    "No": index + 1,
                    "Kode Tenaga Medis": tm.kode_tenaga_medis,
                    "Nama Lengkap": tm.nama_tenaga_medis,
                    "Jabatan / Spesialisasi": tm.jabatan,
                    "Email Akun": tm.users?.email || "-",
                    "Role Sistem": roleFormatted
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Tenaga Medis");
            XLSX.writeFile(workbook, "Data_Tenaga_Medis_Klinik.xlsx");
        } catch (error) {
            console.error("Error exporting Excel:", error);
            alert("Gagal mengexport file Excel");
        }
    };

    const totalPages = Math.ceil(tenagaMedisList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = tenagaMedisList.slice(startIndex, startIndex + itemsPerPage);

    const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const windowPrint = window.open("", "", "width=600,height=600");
    if (windowPrint) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Cetak Barcode NIK</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      windowPrint.document.close();
    }
  };

    const [selectedNik, setSelectedNik] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
                <div className="flex flex-col">
                    <span className="text-gray-100 font-bold text-lg leading-none">Kelola Tenaga Medis</span>
                </div>
                <div className="flex space-x-1">
                    <UserAccount notifications={notifications} userName={session?.user?.name || "Admin"} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Data Tenaga Medis</h2>
                    <div className="flex space-x-3">
                        <form method="GET" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input 
                                type="text" name="query" defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari nama/kode..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                        
                        <TambahTenagaMedisButton />
                        
                        <button 
                            onClick={handleExportExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors"
                        >
                            <Download size={16} /> Export Excel
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">No</th>
                                <th className="px-4 py-3 font-medium">Kode</th>
                                <th className="px-4 py-3 font-medium">Nama</th>
                                <th className="px-4 py-3 font-medium">Jabatan</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {}
                            {currentData.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Data tenaga medis masih kosong.</td></tr>
                            ) : (
                                currentData.map((tm, index) => {
                                    const actualNumber = startIndex + index + 1;

                                    return (
                                        <tr key={tm.id_tenaga_medis} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{actualNumber}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{tm.kode_tenaga_medis}</td>
                                            <td className="px-4 py-3">{tm.nama_tenaga_medis}</td>
                                            <td className="px-4 py-3">{tm.jabatan}</td>
                                            <td className="px-4 py-3">{tm.users?.email || "-"}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tm.users?.role === 'dokter' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {tm.users?.role ? tm.users.role.charAt(0).toUpperCase() + tm.users.role.slice(1) : "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center space-x-3 items-center">
                                                    <EditTenagaMedisButton tm={tm} />
                                                    <DeleteTenagaMedisButton id_tenaga_medis={tm.id_tenaga_medis as number} />
                                                    <button 
                                    onClick={() => setSelectedNik(tm.nik)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-all"
                                >
                                    <BarcodeIcon size={16} />
                                </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {selectedNik && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between w-full items-center border-b pb-4">
                            <h3 className="font-bold text-gray-800">Barcode NIK</h3>
                            <button onClick={() => setSelectedNik(null)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                        
                        <div ref={printRef} className="p-4 bg-white border rounded-xl">
                            <Barcode 
                                value={selectedNik} 
                                width={2} 
                                height={80} 
                                fontSize={14}
                                background="#ffffff"
                            />
                        </div>

                        <button 
                            onClick={handlePrint}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-200 transition-all"
                        >
                            <Printer size={18} /> Cetak Barcode 
                        </button>
                    </div>
                </div>
            )}

            <iframe id="ifmcontentstoprint" style={{ height: '0px', width: '0px', position: 'absolute' }}></iframe>
                </div>

                {}
                {}
                {}
                {tenagaMedisList.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <span className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, tenagaMedisList.length)}</span> dari <span className="font-semibold text-gray-900">{tenagaMedisList.length}</span> data
                        </span>
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <span className="text-sm font-bold text-gray-700 px-4">
                                Halaman {currentPage} / {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
}
