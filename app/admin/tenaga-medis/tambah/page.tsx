import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { hash } from "bcrypt"; 

// PERUBAHAN 1: Menambahkan searchParams untuk menangkap pesan error dari URL
export default async function TambahTenagaMedis({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    // Buka parameter pencarian untuk melihat apakah ada error
    const resolvedSearchParams = await searchParams;
    const errorMessage = resolvedSearchParams.error;

    async function simpanData(formData: FormData) {
        "use server"
        
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const nama = formData.get("nama") as string;
        const role = formData.get("role") as "dokter" | "perawat";
        const kode = formData.get("kode") as string;
        const jabatan = formData.get("jabatan") as string;

        const hashedPassword = await hash(password, 10);

        // PERUBAHAN 2: Membungkus query database dengan try...catch
        try {
            await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    name: nama,
                    role: role,
                    tenagaMedis: {
                        create: {
                            kode_tenaga_medis: kode,
                            nama_tenaga_medis: nama,
                            jabatan: jabatan
                        }
                    }
                }
            });
        } catch (error: any) {
            // P2002 adalah kode spesifik Prisma untuk pelanggaran data unik (Unique Constraint)
            if (error.code === 'P2002') {
                redirect("/admin/tenaga-medis/tambah?error=Email sudah terdaftar di sistem! Silakan gunakan email lain.");
            }
            // Tangkap error lainnya
            redirect("/admin/tenaga-medis/tambah?error=Terjadi kesalahan pada sistem saat menyimpan data.");
        }

        // Kalau sukses (tidak masuk ke block catch), arahkan ke tabel
        redirect("/admin/tenaga-medis");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Tenaga Medis / <span className="text-black font-bold">Tambah Data</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <h2 className="font-bold text-lg mb-6 text-black border-b pb-4">Form Tambah Tenaga Medis</h2>
                
                {/* PERUBAHAN 3: Menampilkan kotak merah jika ada error */}
                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-sm font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}
                
                <form action={simpanData} className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Email Login</label>
                            <input type="email" name="email" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="contoh@mail.com" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Password</label>
                            <input type="password" name="password" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Masukkan password" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Nama Lengkap & Gelar</label>
                            <input type="text" name="nama" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: dr. Budi, Sp.A" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Kode Tenaga Medis</label>
                            <input type="text" name="kode" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: DOC-002" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Role Sistem</label>
                            <select name="role" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none bg-white text-base">
                                <option value="dokter">Dokter</option>
                                <option value="perawat">Perawat</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Jabatan Spesifik</label>
                            <input type="text" name="jabatan" required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Cth: Dokter Spesialis Anak" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Link href="/admin/tenaga-medis" className="px-6 py-3 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                            Batal
                        </Link>
                        <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium shadow-sm">
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}