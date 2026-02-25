"use client";

import { Search } from "lucide-react";
import TambahTenagaMedisButton from "@/components/ui/TambahTenagaMedisButton";
import EditTenagaMedisButton from "@/components/ui/EditTenagaMedisButton";
import DeleteTenagaMedisButton from "@/components/ui/DeleteTenagaMedisButton";

export default function TenagaMedisClient({ tenagaMedisList, query }: { tenagaMedisList: any[], query: string }) {
    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Tenaga Medis / <span className="text-black font-bold">Kelola Tenaga Medis</span></h1>
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
                        <button className="border border-blue-400 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">Export CSV</button>
                        
                        {}
                        <TambahTenagaMedisButton />
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
                            {tenagaMedisList.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Data tenaga medis masih kosong.</td></tr>
                            ) : (
                                tenagaMedisList.map((tm, index) => (
                                    <tr key={tm.id_tenaga_medis} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
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
                                                
                                                {}
                                                <EditTenagaMedisButton tm={tm} />
                                                <DeleteTenagaMedisButton id_tenaga_medis={tm.id_tenaga_medis} />

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}