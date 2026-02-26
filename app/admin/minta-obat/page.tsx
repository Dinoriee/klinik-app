import { Search, FileText } from "lucide-react";
import prisma from "@/lib/db"; 
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function MintaObatPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.query || "";

    const permintaanList = await prisma.permintaan_Obat.findMany({
        where: {
            OR: [
                { pegawai: { nama_pegawai: { contains: query, mode: 'insensitive' } } },
                // PERBAIKAN: Menggunakan tenaga_medis (huruf kecil semua)
                { tenaga_medis: { nama_tenaga_medis: { contains: query, mode: 'insensitive' } } },
            ]
        },
        include: {
            pegawai: true,
            // PERBAIKAN: Menggunakan tenaga_medis (huruf kecil semua)
            tenaga_medis: true,
            penyakit: true,
        },
        orderBy: { waktu_permintaan: 'desc' } 
    });

    async function hapusTransaksi(formData: FormData) {
        "use server"
        const id_permintaan = Number(formData.get("id_permintaan"));

        try {
            await prisma.detail_Permintaan_Obat.deleteMany({
                where: { id_permintaan: id_permintaan }
            });

            await prisma.permintaan_Obat.delete({
                where: { id_permintaan: id_permintaan }
            });

            revalidatePath("/admin/minta-obat");
        } catch (error) {
            console.error("Gagal menghapus transaksi:", error);
        }
    }

    const formatWaktu = (tanggal: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(tanggal);
    };

    return(
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Transaksi / <span className="text-black font-bold">Minta Obat</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="font-bold text-lg text-black">Riwayat Permintaan Obat</h2>
                    <div className="flex space-x-3">
                        
                        <form method="GET" action="/admin/minta-obat" className="relative flex items-center">
                            <Search size={16} className="absolute left-3 text-gray-400"/>
                            <input 
                                type="text" 
                                name="query"
                                defaultValue={query}
                                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                placeholder="Cari Pasien / Dokter..."
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>

                        <button className="border border-blue-400 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors text-sm font-medium">Export Rekap</button>
                        <Link href="/admin/minta-obat/tambah" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                            + Buat Permintaan
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">No</th>
                                <th className="px-4 py-3 font-medium">Waktu Transaksi</th>
                                <th className="px-4 py-3 font-medium">Pasien</th>
                                <th className="px-4 py-3 font-medium">Pemeriksa</th>
                                <th className="px-4 py-3 font-medium">Diagnosa Penyakit</th>
                                <th className="px-4 py-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {permintaanList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-400">
                                        {query ? `Tidak ditemukan riwayat untuk "${query}"` : "Belum ada transaksi permintaan obat."}
                                    </td>
                                </tr>
                            ) : (
                                permintaanList.map((trx, index) => (
                                    <tr key={trx.id_permintaan} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3 text-gray-800">{formatWaktu(trx.waktu_permintaan)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{trx.pegawai?.nama_pegawai || "-"}</td>
                                        {/* PERBAIKAN: Menggunakan tenaga_medis (huruf kecil semua) */}
                                        <td className="px-4 py-3">{trx.tenaga_medis?.nama_tenaga_medis || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                {trx.penyakit?.nama_penyakit || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center space-x-3 items-center">
                                                <Link href={`/admin/minta-obat/detail/${trx.id_permintaan}`} className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
                                                    <FileText size={14} /> Detail Obat
                                                </Link>
                                                <form action={hapusTransaksi}>
                                                    <input type="hidden" name="id_permintaan" value={trx.id_permintaan} />
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