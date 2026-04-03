import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  closePresensiMedisById,
  ensureAktivitasMedisTable,
  findTodayPresensiIdByJenis,
  getPresensiMedisById,
  insertAktivitasMedis,
} from "@/lib/medisAktivitas";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const nikPegawai = data?.nik_pegawai;
        const status = data?.status;
        const nik = data?.nik;
        const nama = data?.nama;

        // Backward compatibility: existing flow records "pegawai" sick leave using `nik_pegawai`.
        if (nikPegawai) {
            if (!nikPegawai) {
                return NextResponse.json({ message: "NIK tidak boleh kosong!" }, { status: 400 });
            }

            const pegawai = await prisma.pegawai.findFirst({
                where: { nik: String(nikPegawai) }
            });

            if (!pegawai) {
                return NextResponse.json({ message: `Gagal: NIK ${nikPegawai} tidak terdaftar!` }, { status: 404 });
            }

            await prisma.presensi.create({
                data: {
                    id_pegawai: pegawai.id_pegawai,
                    tipe: status || "sakit",
                }
            });

            revalidatePath("/admin/istirahat-sakit");
            revalidatePath("/medis/istirahat-sakit");

            return NextResponse.json(
                { message: `Sukses mencatat pasien sakit: ${pegawai.nama_pegawai}` }, 
                { status: 200 }
            );
        }

        // New flow: record tenaga medis sick leave using `nik`.
        await ensureAktivitasMedisTable();

        const trimmedNik = typeof nik === "string" ? nik.trim() : "";
        if (!trimmedNik) {
            return NextResponse.json({ message: "NIK tidak boleh kosong!" }, { status: 400 });
        }

        type TenagaMedisLookup = { id_tenaga_medis: string; nama_tenaga_medis: string };
        let tenagaMedis: TenagaMedisLookup | null = null;
        try {
            const rows = await prisma.$queryRaw<TenagaMedisLookup[]>`
                SELECT CAST(id_tenaga_medis AS TEXT) AS id_tenaga_medis, nama_tenaga_medis
                FROM "Tenaga_Medis"
                WHERE CAST(nik AS TEXT) = ${trimmedNik}
                LIMIT 1
            `;
            tenagaMedis = rows[0] ?? null;
        } catch {
            const rows = await prisma.$queryRaw<TenagaMedisLookup[]>`
                SELECT CAST(id_tenaga_medis AS TEXT) AS id_tenaga_medis, nama_tenaga_medis
                FROM "Tenaga_Medis"
                WHERE kode_tenaga_medis = ${trimmedNik}
                LIMIT 1
            `;
            tenagaMedis = rows[0] ?? null;
        }

        if (!tenagaMedis) {
            return NextResponse.json({ message: `Gagal: NIK ${trimmedNik} tidak terdaftar!` }, { status: 404 });
        }

        const idTenagaMedis = String(tenagaMedis.id_tenaga_medis);
        const existingPresensiId = await findTodayPresensiIdByJenis(idTenagaMedis, "istirahat_sakit");

        if (!existingPresensiId) {
            const created = await prisma.presensi_Tenaga_Medis.create({
                data: {
                    id_tenaga_medis: tenagaMedis.id_tenaga_medis,
                    keterangan: "izin",
                },
            });

            await insertAktivitasMedis({
                idTenagaMedis,
                idPresensi: String(created.id_presensi),
                jenis: "istirahat_sakit",
            });

            return NextResponse.json(
                { message: `Istirahat sakit dimulai, semoga lekas pulih ${nama || tenagaMedis.nama_tenaga_medis}` },
                { status: 200 }
            );
        }

        const existingPresensi = await getPresensiMedisById(existingPresensiId);
        if (!existingPresensi) {
            return NextResponse.json({ message: "Data presensi tidak ditemukan." }, { status: 404 });
        }

        if (existingPresensi.jam_keluar) {
            return NextResponse.json(
                { message: "Istirahat sakit untuk hari ini sudah selesai diproses." },
                { status: 400 }
            );
        }

        await closePresensiMedisById(existingPresensiId);

        return NextResponse.json(
            { message: `Istirahat sakit selesai, semoga sehat kembali ${nama || tenagaMedis.nama_tenaga_medis}` },
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error("Error API Istirahat Sakit:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
