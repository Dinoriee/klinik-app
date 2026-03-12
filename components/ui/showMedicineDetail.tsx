'use client'

import { Eye } from "lucide-react"
import { useState } from "react"

interface obat{
    nama_obat: string,
    stok_saat_ini: string,
    expired_date: string,
    reorder_level: number,
}

export default function ShowMedicineDetail({obat} : {obat: obat[]}){
    const [isOpen, setOpen] = useState(false);
    const lowStock = obat.filter((item) => Number(item.stok_saat_ini) < item.reorder_level);
    const now = new Date();
    const expired = obat.filter((item) => {
        const expiredDate = new Date(item.expired_date);
        return now > expiredDate;
    });

    return(
        <>
        <Eye size={24} onClick={() => setOpen(true)} className={` p-1 rounded-md transition-all duration-200 shadow-md ${isOpen ? "bg-blue-300" : "bg-gray-300 hover:bg-gray-200"}`}/>
        {isOpen && (
            <div className="absolute shadow-md flex justify-between left-1/2 top-0 z-50 rounded-2xl h-48 w-1/4 overflow-auto border bg-linear-0 from-blue-400 to-blue-500" onMouseLeave={() => setOpen(false)}>
                <div className="flex flex-col gap-4 w-1/2 h-full text-nowrap">
                    <span className="text-md text-white border-b p-4">Obat Segera Expired</span>
                    <ul className="p-4">
                        {expired.length < 0 ? (
                            lowStock.map((item) => (
                            <li className="flex flex-col border-t border-b first:border-t-0 last:border-b-0 text-white">
                                <span className="font-bold">{item.nama_obat}</span>
                                <span className="italic text-gray-400">Expired: {item.expired_date}</span>
                            </li>
                        ))) : (
                            <div>
                                <p className="text-white">Tidak ada data</p>
                            </div>
                        )}
                    </ul>
                </div>
                <div className="flex flex-col gap-4 w-1/2 h-full">
                    <span className="text-md text-white border-b p-4">Stok Menipis</span>
                    <ul className="p-4">
                        {lowStock.length > 0 ? (
                            lowStock.map((item) => (
                            <li className="flex flex-col border-t border-b first:border-t-0 last:border-b-0 text-white">
                                <span className="font-bold">{item.nama_obat}</span>
                                <span className="italic text-xs">Jumlah obat saat ini: {item.stok_saat_ini}</span>
                            </li>
                        ))) : (
                            <div>
                                <p className="text-white">Tidak ada data</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        )}
        </>
    )
}