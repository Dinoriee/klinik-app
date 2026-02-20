import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { hash } from "bcrypt"; 

export default async function EditTenagaMedis({ 
    params,
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ error?: string }>
}) {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    
    // Tangkap error dari URL jika ada
    const resolvedSearchParams = await searchParams;
    const errorMessage = resolvedSearchParams.error;

    const tenagaMedis = await prisma.tenaga_Medis.findUnique({
        where: { id_tenaga_medis: id },
        include: { users: true }
    });

    if (!tenagaMedis) {
        redirect("/admin/tenaga-medis");
    }

    async function updateData(formData: FormData) {
        "use server"
        
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const nama = formData.get("nama") as string;
        const role = formData.get("role") as "dokter" | "perawat";
        const kode = formData.get("kode") as string;
        const jabatan = formData.get("jabatan") as string;

        const dataUser: any = {
            email: email,
            name: nama,
            role: role,
        };

        if (password) {
            dataUser.password = await hash(password, 10);
        }

        try {
            await prisma.user.update({
                where: { id_user: tenagaMedis?.id_user },
                data: dataUser
            });

            await prisma.tenaga_Medis.update({
                where: { id_tenaga_medis: id },
                data: {
                    kode_tenaga_medis: kode,
                    nama_tenaga_medis: nama,
                    jabatan: jabatan
                }
            });
        } catch (error: any) {
            // Tangkap jika update menggunakan email yang sudah dipakai orang lain
            if (error.code === 'P2002') {
                redirect(`/admin/tenaga-medis/edit/${id}?error=Email sudah terdaftar di sistem! Silakan gunakan email lain.`);
            }
            redirect(`/admin/tenaga-medis/edit/${id}?error=Terjadi kesalahan pada sistem saat menyimpan data.`);
        }

        redirect("/admin/tenaga-medis");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Tenaga Medis / <span className="text-black font-bold">Edit Data</span></h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
                <h2 className="font-bold text-lg mb-6 text-black border-b pb-4">Form Edit Tenaga Medis</h2>
                
                {/* Kotak merah peringatan error */}
                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md text-sm font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}
                
                <form action={updateData} className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Email Login</label>
                            <input type="email" name="email" defaultValue={tenagaMedis.users.email} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Password Baru <span className="text-xs text-gray-400 font-normal">(Kosongkan jika tidak ingin ganti)</span></label>
                            <input type="password" name="password" className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" placeholder="Ketik password baru..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Nama Lengkap & Gelar</label>
                            <input type="text" name="nama" defaultValue={tenagaMedis.nama_tenaga_medis} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Kode Tenaga Medis</label>
                            <input type="text" name="kode" defaultValue={tenagaMedis.kode_tenaga_medis} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Role Sistem</label>
                            <select name="role" defaultValue={tenagaMedis.users.role} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none bg-white text-base">
                                <option value="dokter">Dokter</option>
                                <option value="perawat">Perawat</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Jabatan Spesifik</label>
                            <input type="text" name="jabatan" defaultValue={tenagaMedis.jabatan} required className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-base" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Link href="/admin/tenaga-medis" className="px-6 py-3 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
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