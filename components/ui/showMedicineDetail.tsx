'use client'

import { AlertCircle, Eye, PackageSearch } from "lucide-react"
import { useState } from "react"

interface obat{
    nama_obat: string,
    stok_saat_ini: number,
    expired_date: string,
    reorder_level: number,
}

export default function ShowMedicineDetail({ obat = [] }: { obat?: obat[] }) {
    const [isOpen, setOpen] = useState(false);
    const now = new Date();

    const lowStock = obat.filter((item) => item.stok_saat_ini < item.reorder_level);
    const expired = obat.filter((item) => new Date(item.expired_date) < now);

    return(
        <div className="relative inline-block">
            <Eye 
                size={32} 
                onClick={() => setOpen(!isOpen)} 
                className={`p-1.5 rounded-lg cursor-pointer transition-all duration-300 shadow-md ${
                    isOpen ? "bg-blue-500 text-white scale-110" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            />

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-3 w-[500px] flex gap-0 z-50 rounded-2xl overflow-hidden border border-blue-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                        
                        <div className="w-1/2 border-r border-blue-50">
                            <div className="bg-red-50 p-3 border-b border-red-100 flex items-center gap-2">
                                <AlertCircle size={14} className="text-red-500" />
                                <span className="text-xs font-black text-red-600 uppercase tracking-wider">Expired</span>
                            </div>
                            <ul className="max-h-64 overflow-y-auto p-2 space-y-2 bg-white">
                                {expired.length > 0 ? (
                                    expired.map((item) => (
                                        <li key={`${item.nama_obat}-${item.expired_date}`} className="p-2 rounded-lg bg-red-50/30 border border-red-50 flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 leading-tight">{item.nama_obat}</span>
                                            <span className="text-[10px] text-red-500 font-mono mt-1">Lewat: {new Date(item.expired_date).toLocaleDateString('id-ID')}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic text-center py-8">Tidak ada obat expired.</p>
                                )}
                            </ul>
                        </div>

                        <div className="w-1/2">
                            <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center gap-2">
                                <PackageSearch size={14} className="text-blue-500" />
                                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Menipis</span>
                            </div>
                            <ul className="max-h-64 overflow-y-auto p-2 space-y-2 bg-white">
                                {lowStock.length > 0 ? (
                                    lowStock.map((item) => (
                                        <li key={`${item.nama_obat}-${item.reorder_level}`} className="p-2 rounded-lg bg-blue-50/30 border border-blue-50 flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 leading-tight">{item.nama_obat}</span>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] text-blue-500 font-bold">Sisa: {item.stok_saat_ini}</span>
                                                <span className="text-[9px] bg-blue-200 text-blue-700 px-1 rounded">Min: {item.reorder_level}</span>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic text-center py-8">Tidak ada stok yang menipis.</p>
                                )}
                            </ul>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
