import { Search, User } from "lucide-react";
import { AuthOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"


const KelolaTenagaMedis = async () => {
    const session = await getServerSession(AuthOptions);
    console.log(session); 
    
    return(
        <div>
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik<span className="text-black"> / Konsultasi Dokter</span></h1>
                    <span className="text-black font-bold">Konsultasi Dokter</span>
                </div>
                <div className="flex space-x-1">
                    <User size={24} className="bg-gray-400 rounded-2xl text-gray-800"/>
                    <span className="text-gray-800">{session?.user.role}</span>
                </div>
            </div>
            <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
                <div className="flex justify-between">
                    <h2 className="font-bold">Data Tenaga Medis</h2>
                    <div className="flex space-x-2 p-2">
                        <button className="border-2 border-blue-300 hover:border-purple-300 h-8 rounded-md transition-colors duration-200 min-w-16">Import</button>
                        <button className="bg-blue-400 hover:bg-purple-300 min-w-36 h-8 rounded-md transition-colors duration-200 text-white">+ Tambah Data</button>
                        <div className="flex relative">
                            <Search size={16} className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type="text" className="pl-6 border rounded-md border-gray-300 h-8" placeholder="Cari disini..."/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KelolaTenagaMedis