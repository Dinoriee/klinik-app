import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function EditObat({ 
    params,
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ error?: string }>
}) {
    // Buka parameter ID dari URL
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    
    // Tangkap error dari URL jika ada
    const resolvedSearchParams = await searchParams;
    const errorMessage = resolvedSearchParams.error;

    // Cari data obat lama di database berdasarkan ID
    const obat = await prisma.obat.findUnique({
        where: { id_obat: id }
    });

    // Kalau data tidak ditemukan, tendang balik ke tabel
    if (!obat) {
        redirect("/admin/kelola-obat");
    }

    // Mengubah format ISO dari database menjadi YYYY-MM-DD agar bisa terbaca oleh <input type="date">
    const formattedDate = obat.expired_date.toISOString().split('T')[0];

    // Server Action untuk memproses update
    async function updateData(formData: FormData) {
        "use server"
        
        const nama_obat = formData.get("nama_obat") as string;
        const nama_batch = formData.get("nama_batch") as string;
        const stok_saat_ini = Number(formData.get("stok_saat_ini"));
        const satuan = formData.get("satuan") as string;
        const expired_date = new Date(formData.get("expired_date") as string).toISOString();
        const reorder_level = Number(formData.get("reorder_level"));
        const jenis_obat = formData.get("jenis_obat") as "tablet" | "kapsul" | "sirup" | "salep" | "injeksi" | "tetes" | "puyer";

        try {
            await prisma.obat.update({
                where: { id_obat: id },
                data: {
                    nama_obat: nama_obat,
                    nama_batch: nama_batch,
                    stok_saat_ini: stok_saat_ini,
                    satuan: satuan,
                    expired_date: expired_date,
                    reorder_level: reorder_level,
                    jenis_obat: jenis_obat
                }
            });
        } catch (error: any) {
            console.error(error);
            redirect(`/admin/kelola-obat/edit/${id}?error=Gagal menyimpan perubahan data obat!`);
        }

        redirect("/admin/kelola-obat");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Obat / <span className="text-black font-bold">Edit Data Obat</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <h2 className="font-bold text-lg mb-6 text-black border-b pb-4">Form Edit Data Obat</h2>
                
                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-sm font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}
                
                <form action={updateData} className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Nama Obat</label>
                            <input type="text" name="nama_obat" defaultValue={obat.nama_obat} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Nomor Batch</label>
                            <input type="text" name="nama_batch" defaultValue={obat.nama_batch} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Jenis Obat</label>
                            <select name="jenis_obat" defaultValue={obat.jenis_obat} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none bg-white text-base">
                                <option value="tablet">Tablet</option>
                                <option value="kapsul">Kapsul</option>
                                <option value="sirup">Sirup</option>
                                <option value="salep">Salep</option>
                                <option value="injeksi">Injeksi</option>
                                <option value="tetes">Tetes</option>
                                <option value="puyer">Puyer</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Satuan</label>
                            <input type="text" name="satuan" defaultValue={obat.satuan} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Stok Awal</label>
                            <input type="number" name="stok_saat_ini" defaultValue={obat.stok_saat_ini} min="0" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Batas Minimum (Reorder)</label>
                            <input type="number" name="reorder_level" defaultValue={obat.reorder_level} min="0" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Tanggal Kedaluwarsa</label>
                            {/* Memasukkan formattedDate sebagai defaultValue */}
                            <input type="date" name="expired_date" defaultValue={formattedDate} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base bg-white" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Link href="/admin/kelola-obat" className="px-6 py-3 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                            Batal
                        </Link>
                        <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium shadow-sm">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}