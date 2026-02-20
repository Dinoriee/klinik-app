import { Search, User } from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db"; 
import Link from "next/link";
import { revalidatePath } from "next/cache";

// PERUBAHAN 1: Menambahkan searchParams untuk menangkap kata kunci pencarian dari URL
export default async function KelolaTenagaMedis({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const session = await getServerSession(AuthOptions);
    
    // Buka (unwrap) searchParams sesuai aturan Next.js 16
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";

    // PERUBAHAN 2: Menambahkan filter 'where' dan 'contains' pada Prisma
    const tenagaMedisList = await prisma.tenaga_Medis.findMany({
        where: {
            OR: [
                { nama_tenaga_medis: { contains: query, mode: 'insensitive' } },
                { kode_tenaga_medis: { contains: query, mode: 'insensitive' } },
                { jabatan: { contains: query, mode: 'insensitive' } },
            ]
        },
        include: { users: true },
        orderBy: { id_tenaga_medis: 'asc' }
    });

    // Server Action untuk menghapus data
    async function hapusData(formData: FormData) {
        "use server"
        const id_tenaga_medis = Number(formData.get("id_tenaga_medis"));
        const id_user = Number(formData.get("id_user"));

        await prisma.tenaga_Medis.delete({
            where: { id_tenaga_medis: id_tenaga_medis }
        });

        await prisma.user.delete({
            where: { id_user: id_user }
        });

        revalidatePath("/admin/tenaga-medis");
    }

    return(
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Tenaga Medis / <span className="text-black font-bold">Kelola Tenaga Medis</span></h1>
                </div>
                <div className="flex space-x-2 items-center">
                    <User size={24} className="bg-gray-200 rounded-full p-1 text-gray-800"/>
                    <span className="text-gray-800 capitalize">{session?.user?.role || "Admin"}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Data Tenaga Medis</h2>
                    <div className="flex space-x-3">
                        
                        {/* PERUBAHAN 3: Membungkus input pencarian dengan <form> */}
                        <form method="GET" action="/admin/tenaga-medis" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400"/>
                            <input 
                                type="text" 
                                name="query" // Nama parameter di URL
                                defaultValue={query} // Mengisi otomatis input dengan kata kunci yang sedang dicari
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari nama/kode..."
                            />
                            {/* Tombol submit tak terlihat agar bisa ditekkan 'Enter' */}
                            <button type="submit" className="hidden">Cari</button>
                        </form>

                        <button className="border border-blue-400 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">Import</button>
                        <Link href="/admin/tenaga-medis/tambah" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">+ Tambah Data</Link>
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
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-400">
                                        {query ? `Tidak ditemukan hasil untuk "${query}"` : "Belum ada data tenaga medis."}
                                    </td>
                                </tr>
                            ) : (
                                tenagaMedisList.map((tm, index) => (
                                    <tr key={tm.id_tenaga_medis} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{tm.kode_tenaga_medis}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{tm.nama_tenaga_medis}</td>
                                        <td className="px-4 py-3 capitalize">{tm.jabatan}</td>
                                        <td className="px-4 py-3">{tm.users.email}</td>
                                        <td className="px-4 py-3 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tm.users.role === 'dokter' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {tm.users.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center space-x-3 items-center">
                                                <Link href={`/admin/tenaga-medis/edit/${tm.id_tenaga_medis}`} className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                                                    Edit
                                                </Link>
                                                <form action={hapusData}>
                                                    <input type="hidden" name="id_tenaga_medis" value={tm.id_tenaga_medis} />
                                                    <input type="hidden" name="id_user" value={tm.id_user} />
                                                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer">
                                                        Hapus
                                                    </button>
                                                </form>
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
    )
}