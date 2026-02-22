import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function TambahObat({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const errorMessage = resolvedSearchParams.error;

    // Server Action untuk memproses form
    async function simpanData(formData: FormData) {
        "use server"
        
        // Ambil data dari input form
        const nama_obat = formData.get("nama_obat") as string;
        const nama_batch = formData.get("nama_batch") as string;
        const stok_saat_ini = Number(formData.get("stok_saat_ini"));
        const satuan = formData.get("satuan") as string;
        // Format tanggal dari input HTML (YYYY-MM-DD) menjadi format Date Prisma (ISO-8601)
        const expired_date = new Date(formData.get("expired_date") as string).toISOString();
        const reorder_level = Number(formData.get("reorder_level"));
        // Jenis obat sesuai Enum di database
        const jenis_obat = formData.get("jenis_obat") as "tablet" | "kapsul" | "sirup" | "salep" | "injeksi" | "tetes" | "puyer";

        try {
            // Simpan ke database tabel Obat
            await prisma.obat.create({
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
            redirect("/admin/kelola-obat/tambah?error=Gagal menyimpan data obat! Pastikan semua kolom terisi dengan benar.");
        }

        // Arahkan kembali ke halaman tabel setelah sukses
        redirect("/admin/kelola-obat");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Obat / <span className="text-black font-bold">Tambah Obat Baru</span></h1>
                </div>
            </div>

            {/* Kotak form dibuat full-width dengan margin yang persis dengan tabel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <h2 className="font-bold text-lg mb-6 text-black border-b pb-4">Form Tambah Data Obat</h2>
                
                {/* Kotak merah peringatan error jika ada kegagalan simpan */}
                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-sm font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}
                
                <form action={simpanData} className="flex flex-col gap-6">
                    {/* Baris 1: Nama & Batch */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Nama Obat</label>
                            <input type="text" name="nama_obat" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: Paracetamol 500mg" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Nomor Batch</label>
                            <input type="text" name="nama_batch" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: BATCH-2026-A1" />
                        </div>
                    </div>

                    {/* Baris 2: Jenis & Satuan */}
                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Jenis Obat</label>
                            <select name="jenis_obat" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none bg-white text-base">
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
                            <input type="text" name="satuan" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: Strip, Botol, Tube, Box" />
                        </div>
                    </div>

                    {/* Baris 3: Stok, Reorder Level, & Expired Date */}
                    <div className="grid grid-cols-3 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Stok Awal</label>
                            <input type="number" name="stok_saat_ini" min="0" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: 100" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Batas Minimum (Reorder)</label>
                            <input type="number" name="reorder_level" min="0" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: 20" title="Notifikasi akan muncul jika stok di bawah angka ini" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Tanggal Kedaluwarsa</label>
                            <input type="date" name="expired_date" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base bg-white" />
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-3 mt-8">
                        <Link href="/admin/kelola-obat" className="px-6 py-3 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                            Batal
                        </Link>
                        <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium shadow-sm">
                            Simpan Obat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}