'use client'

import { Eye } from "lucide-react"
import { useState } from "react"

export default function ShowMedicineDetail(){
    const [isOpen, setOpen] = useState(false);
    return(
        <>
        <Eye size={24} onClick={() => setOpen(true)} className={` p-1 rounded-md transition-all duration-200 shadow-md ${isOpen ? "bg-blue-300" : "bg-gray-300 hover:bg-gray-200"}`}/>
        {isOpen && (
            <div className="absolute bg-white shadow-md flex justify-between space-x-12 left-1/2 top-0 z-50 rounded-2xl p-4" onMouseLeave={() => setOpen(false)}>
                <div className="flex flex-col gap-4">
                    <span className="text-2xl">Obat Segera Expired</span>
                    <ul className="">
                        <li className="flex flex-col border-t border-b first:border-t-0 last:border-b-0">
                            <span className="font-bold">Nama obat</span>
                            <span className="italic text-gray-400">desc</span>
                        </li>
                        <li className="flex flex-col border-t border-b first:border-t-0 last:border-b-0">
                            <span className="font-bold">Nama obat</span>
                            <span className="italic text-gray-400">desc</span>
                        </li>
                        <li className="flex flex-col border-t border-b first:border-t-0 last:border-b-0">
                            <span className="font-bold">Nama obat</span>
                            <span className="italic text-gray-400">desc</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <span>Stok Menipis</span>
                    <ul>

                    </ul>
                </div>
            </div>
        )}
        </>
    )
}