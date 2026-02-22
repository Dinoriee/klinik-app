import { Search, Package } from "lucide-react";
import prisma from "@/lib/db"; 
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function KelolaObat({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";

    const obatList = await prisma.obat.findMany({
        where: {
            OR: [
                { nama_obat: { contains: query, mode: 'insensitive' } },
                { nama_batch: { contains: query, mode: 'insensitive' } },
            ]
        },
        orderBy: { id_obat: 'desc' } 
    });

    async function hapusData(formData: FormData) {
        "use server"
        const id_obat = Number(formData.get("id_obat"));
        try {
            await prisma.obat.delete({
                where: { id_obat: id_obat }
            });
            revalidatePath("/admin/kelola-obat");
        } catch (error) {
            console.error("Gagal menghapus obat:", error);
        }
    }

    const formatTanggal = (tanggal: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(tanggal);
    };

    // Ambil waktu saat ini untuk perbandingan expired
    const tanggalHariIni = new Date();

    return(
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Obat / <span className="text-black font-bold">Kelola Obat</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Daftar Stok Obat</h2>
                    <div className="flex space-x-3">
                        <form method="GET" action="/admin/kelola-obat" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400"/>
                            <input 
                                type="text" 
                                name="query"
                                defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari obat / batch..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                        <button className="border border-blue-400 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">Export CSV</button>
                        <Link href="/admin/kelola-obat/tambah" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">+ Tambah Obat</Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">No</th>
                                <th className="px-4 py-3 font-medium">Nama Obat</th>
                                <th className="px-4 py-3 font-medium">Batch</th>
                                <th className="px-4 py-3 font-medium">Jenis</th>
                                <th className="px-4 py-3 font-medium text-center">Stok</th>
                                <th className="px-4 py-3 font-medium">Expired Date</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {obatList.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-400">
                                        {query ? `Tidak ditemukan hasil untuk "${query}"` : "Stok obat masih kosong."}
                                    </td>
                                </tr>
                            ) : (
                                obatList.map((obat, index) => {
                                    // LOGIKA STATUS BARU: Cek Kedaluwarsa & Cek Stok
                                    const isExpired = new Date(obat.expired_date) < tanggalHariIni;
                                    const isMenipis = obat.stok_saat_ini <= obat.reorder_level;

                                    return (
                                        <tr key={obat.id_obat} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{obat.nama_obat}</td>
                                            <td className="px-4 py-3">{obat.nama_batch}</td>
                                            <td className="px-4 py-3 capitalize">{obat.jenis_obat}</td>
                                            <td className="px-4 py-3 text-center font-medium">
                                                {obat.stok_saat_ini} {obat.satuan}
                                            </td>
                                            <td className="px-4 py-3">{formatTanggal(obat.expired_date)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {/* Tampilan label berubah dinamis sesuai kondisi */}
                                                {isExpired ? (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Kedaluwarsa</span>
                                                ) : isMenipis ? (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Menipis</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aman</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center space-x-3 items-center">
                                                    <Link href={`/admin/kelola-obat/edit/${obat.id_obat}`} className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                                                        Edit
                                                    </Link>
                                                    <form action={hapusData}>
                                                        <input type="hidden" name="id_obat" value={obat.id_obat} />
                                                        <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer">
                                                            Hapus
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}