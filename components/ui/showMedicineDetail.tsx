'use client'

import { Eye } from "lucide-react"
import { useState } from "react"

interface MedicineDetailItem {
    nama_obat: string,
    stok_saat_ini: number | string,
    expired_date: Date | string,
    reorder_level: number,
}

const formatExpiredDate = (value: Date | string) => {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export default function ShowMedicineDetail({obat = []} : {obat?: MedicineDetailItem[]}){
    const [isOpen, setOpen] = useState(false);
    
    // Karena sudah dijamin minimal berupa array kosong [], fungsi filter ini sekarang aman dari error
    const lowStock = obat.filter((item) => Number(item.stok_saat_ini) < item.reorder_level);
    const now = new Date();
    const expired = obat.filter((item) => {
        const expiredDate = new Date(item.expired_date);
        return now > expiredDate;
    });

    return(
        <>
        <Eye size={24} onClick={() => setOpen(true)} className={` cursor-pointer p-1 rounded-md transition-all duration-200 shadow-md ${isOpen ? "bg-blue-300" : "bg-gray-300 hover:bg-gray-200"}`}/>
        
        {isOpen && (
            <div className="absolute shadow-md flex justify-between left-1/2 top-0 z-50 rounded-2xl h-48 w-1/4 overflow-auto border bg-linear-0 from-blue-400 to-blue-500" onMouseLeave={() => setOpen(false)}>
                
                <div className="flex flex-col gap-4 w-1/2 h-full text-nowrap">
                    <span className="text-md text-white border-b p-4 font-semibold">Obat Segera Expired</span>
                    <ul className="p-4">
                        {/* PERBAIKAN 2: Ubah < 0 menjadi > 0, dan gunakan variabel 'expired' */}
                        {expired.length > 0 ? (
                            expired.map((item, index) => (
                            <li key={index} className="flex flex-col border-t border-b first:border-t-0 last:border-b-0 border-blue-300 py-1 text-white">
                                <span className="font-bold">{item.nama_obat}</span>
                                <span className="italic text-gray-200 text-xs">Expired: {formatExpiredDate(item.expired_date)}</span>
                            </li>
                        ))) : (
                            <div>
                                <p className="text-blue-100 text-sm italic">Tidak ada data</p>
                            </div>
                        )}
                    </ul>
                </div>

                <div className="flex flex-col gap-4 w-1/2 h-full">
                    <span className="text-md text-white border-b p-4 font-semibold">Stok Menipis</span>
                    <ul className="p-4">
                        {lowStock.length > 0 ? (
                            lowStock.map((item, index) => (
                            <li key={index} className="flex flex-col border-t border-b first:border-t-0 last:border-b-0 border-blue-300 py-1 text-white">
                                <span className="font-bold">{item.nama_obat}</span>
                                <span className="italic text-xs text-blue-100">Sisa stok: {item.stok_saat_ini}</span>
                            </li>
                        ))) : (
                            <div>
                                <p className="text-blue-100 text-sm italic">Tidak ada data</p>
                            </div>
                        )}
                    </ul>
                </div>

            </div>
        )}
        </>
    )
}
