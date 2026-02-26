import prisma from "@/lib/db";
import FormDynamic from "./FormDynamic";
import { redirect } from "next/navigation";

export default async function TambahMintaObatPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const errorMessage = resolvedSearchParams.error;

    const obats = await prisma.obat.findMany({
        where: { stok_saat_ini: { gt: 0 } },
        select: {
            id_obat: true,
            nama_obat: true,
            stok_saat_ini: true,
            satuan: true
        },
        orderBy: { nama_obat: 'asc' }
    });

    async function simpanTransaksi(formData: FormData) {
        "use server"

        const idObats = formData.getAll("id_obat");
        const jumlahs = formData.getAll("jumlah");

        let isError = false;
        let pesanError = "";

        try {
            await prisma.$transaction(async (tx) => {
                
                // SOLUSI CERDAS: Cari data pertama yang ada di tabel master
                const dummyPegawai = await tx.pegawai.findFirst();
                const dummyTenagaMedis = await tx.tenaga_Medis.findFirst();
                const dummyPenyakit = await tx.penyakit.findFirst();

                // Cek jika tabel master benar-benar kosong
                if (!dummyPegawai || !dummyTenagaMedis || !dummyPenyakit) {
                    throw new Error("Gagal! Kamu harus menambahkan minimal 1 data di menu Kelola Pegawai, Kelola Tenaga Medis, dan Kelola Penyakit agar sistem bisa mencatat pengeluaran obat.");
                }

                // Gunakan ID yang ditemukan sistem, bukan angka 1
                const permintaan = await tx.permintaan_Obat.create({
                    data: {
                        id_pegawai: dummyPegawai.id_pegawai,       
                        id_tenaga_medis: dummyTenagaMedis.id_tenaga_medis,  
                        id_penyakit: dummyPenyakit.id_penyakit,      
                    }
                });

                for (let i = 0; i < idObats.length; i++) {
                    const id_obat = Number(idObats[i]);
                    const jumlah = Number(jumlahs[i]);

                    if (id_obat && jumlah > 0) {
                        const cekObat = await tx.obat.findUnique({ where: { id_obat: id_obat } });

                        if (!cekObat || cekObat.stok_saat_ini < jumlah) {
                            throw new Error(`Stok obat ${cekObat?.nama_obat || ''} tidak mencukupi!`);
                        }

                        await tx.detail_Permintaan_Obat.create({
                            data: {
                                id_permintaan: permintaan.id_permintaan,
                                id_obat: id_obat,
                                jumlah_diminta: jumlah
                            }
                        });

                        await tx.obat.update({
                            where: { id_obat: id_obat },
                            data: { stok_saat_ini: { decrement: jumlah } }
                        });
                    }
                }
            });
        } catch (error: any) {
            console.error("Error Database:", error);
            isError = true;
            pesanError = error.message || "Terjadi kesalahan pada sistem saat mengurangi stok obat.";
        }

        if (isError) {
            redirect(`/admin/minta-obat/tambah?error=${pesanError}`);
        } else {
            redirect("/admin/minta-obat");
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4">
                <div className="flex flex-col">
                    <h1 className="text-gray-400">Klinik / Transaksi / <span className="text-black font-bold">Ambil Obat</span></h1>
                </div>
            </div>

            <FormDynamic obats={obats} actionSimpan={simpanTransaksi} errorMessage={errorMessage} />
        </div>
    );
}