import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

// GET - Mengambil daftar kwitansi dengan data rekam medis terkait
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get("query") || "").trim();
        const status = searchParams.get("status");

        // The generated Prisma Client in this repo can be out-of-sync (missing `kwitansi` / `rekam_medis` models).
        // Use raw SQL to keep the API working.
        type Row = {
            id_kwitansi: string;
            id_rekam_medis: string;
            total_biaya: number | string | null;
            status: string;
            tanggal_terbit: Date | string;
            tanggal_lunas: Date | string | null;
            keluhan: string;
            diagnosa: string;
            tanggal_periksa: Date | string;
            id_pegawai: string;
            nama_pegawai: string;
            nomor_pegawai: string;
            id_tenaga_medis: string;
            nama_tenaga_medis: string;
        };

        const like = `%${query}%`;
        const statusParam = status ? String(status) : null;

        const rows = await prisma.$queryRaw<Row[]>`
            SELECT
                CAST(k.id_kwitansi AS TEXT) AS id_kwitansi,
                CAST(k.id_rekam_medis AS TEXT) AS id_rekam_medis,
                k.total_biaya,
                CAST(k.status AS TEXT) AS status,
                k.tanggal_terbit,
                k.tanggal_lunas,
                r.keluhan,
                r.diagnosa,
                r.tanggal_periksa,
                CAST(p.id_pegawai AS TEXT) AS id_pegawai,
                p.nama_pegawai,
                p.nomor_pegawai,
                CAST(t.id_tenaga_medis AS TEXT) AS id_tenaga_medis,
                t.nama_tenaga_medis
            FROM "Kwitansi" k
            INNER JOIN "Rekam_Medis" r ON r.id_rekam_medis = k.id_rekam_medis
            INNER JOIN "Pegawai" p ON p.id_pegawai = r.id_pegawai
            INNER JOIN "Tenaga_Medis" t ON t.id_tenaga_medis = r.id_tenaga_medis
            WHERE
                (${query} = '' OR p.nama_pegawai ILIKE ${like} OR CAST(k.id_kwitansi AS TEXT) ILIKE ${like})
                AND (${statusParam} IS NULL OR CAST(k.status AS TEXT) = ${statusParam})
            ORDER BY k.tanggal_terbit DESC
        `;

        const kwitansiList = rows.map((row) => ({
            id_kwitansi: String(row.id_kwitansi),
            id_rekam_medis: String(row.id_rekam_medis),
            total_biaya: row.total_biaya === null ? null : Number(row.total_biaya),
            status: row.status,
            tanggal_terbit:
                row.tanggal_terbit instanceof Date
                    ? row.tanggal_terbit.toISOString()
                    : new Date(row.tanggal_terbit).toISOString(),
            tanggal_lunas:
                row.tanggal_lunas === null
                    ? null
                    : row.tanggal_lunas instanceof Date
                        ? row.tanggal_lunas.toISOString()
                        : new Date(row.tanggal_lunas).toISOString(),
            rekam_medis: {
                id_rekam_medis: String(row.id_rekam_medis),
                keluhan: row.keluhan,
                diagnosa: row.diagnosa,
                tanggal_periksa:
                    row.tanggal_periksa instanceof Date
                        ? row.tanggal_periksa.toISOString()
                        : new Date(row.tanggal_periksa).toISOString(),
                pegawai: {
                    id_pegawai: String(row.id_pegawai),
                    nama_pegawai: row.nama_pegawai,
                    nomor_pegawai: row.nomor_pegawai,
                },
                tenaga_medis: {
                    id_tenaga_medis: String(row.id_tenaga_medis),
                    nama_tenaga_medis: row.nama_tenaga_medis,
                },
            },
        }));

        return NextResponse.json(kwitansiList, { status: 200 });
    } catch (error) {
        console.error("Error GET Kwitansi:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data kwitansi" },
            { status: 500 }
        );
    }
}

// PUT - Update status pembayaran kwitansi
export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id_kwitansi, status, total_biaya } = data;

        if (!id_kwitansi) {
            return NextResponse.json(
                { message: "ID kwitansi harus disertakan" },
                { status: 400 }
            );
        }

        const parsedTotal = total_biaya === null || total_biaya === undefined ? null : Number(total_biaya);
        if (parsedTotal !== null && Number.isNaN(parsedTotal)) {
            return NextResponse.json({ message: "Total biaya tidak valid" }, { status: 400 });
        }

        const statusText = status ? String(status) : null;
        if (!statusText) {
            return NextResponse.json({ message: "Status harus disertakan" }, { status: 400 });
        }

        if (statusText === "lunas") {
            await prisma.$executeRaw`
                UPDATE "Kwitansi"
                SET status = ${statusText},
                    total_biaya = ${parsedTotal},
                    tanggal_lunas = NOW()
                WHERE id_kwitansi = ${String(id_kwitansi)}
            `;
        } else {
            await prisma.$executeRaw`
                UPDATE "Kwitansi"
                SET status = ${statusText},
                    total_biaya = ${parsedTotal}
                WHERE id_kwitansi = ${String(id_kwitansi)}
            `;
        }

        // Return updated row (same shape as GET)
        type Row = {
            id_kwitansi: string;
            id_rekam_medis: string;
            total_biaya: number | string | null;
            status: string;
            tanggal_terbit: Date | string;
            tanggal_lunas: Date | string | null;
            keluhan: string;
            diagnosa: string;
            tanggal_periksa: Date | string;
            id_pegawai: string;
            nama_pegawai: string;
            nomor_pegawai: string;
            id_tenaga_medis: string;
            nama_tenaga_medis: string;
        };

        const rows = await prisma.$queryRaw<Row[]>`
            SELECT
                CAST(k.id_kwitansi AS TEXT) AS id_kwitansi,
                CAST(k.id_rekam_medis AS TEXT) AS id_rekam_medis,
                k.total_biaya,
                CAST(k.status AS TEXT) AS status,
                k.tanggal_terbit,
                k.tanggal_lunas,
                r.keluhan,
                r.diagnosa,
                r.tanggal_periksa,
                CAST(p.id_pegawai AS TEXT) AS id_pegawai,
                p.nama_pegawai,
                p.nomor_pegawai,
                CAST(t.id_tenaga_medis AS TEXT) AS id_tenaga_medis,
                t.nama_tenaga_medis
            FROM "Kwitansi" k
            INNER JOIN "Rekam_Medis" r ON r.id_rekam_medis = k.id_rekam_medis
            INNER JOIN "Pegawai" p ON p.id_pegawai = r.id_pegawai
            INNER JOIN "Tenaga_Medis" t ON t.id_tenaga_medis = r.id_tenaga_medis
            WHERE k.id_kwitansi = ${String(id_kwitansi)}
            LIMIT 1
        `;

        const row = rows[0];
        const kwitansi = row
            ? {
                id_kwitansi: String(row.id_kwitansi),
                id_rekam_medis: String(row.id_rekam_medis),
                total_biaya: row.total_biaya === null ? null : Number(row.total_biaya),
                status: row.status,
                tanggal_terbit:
                    row.tanggal_terbit instanceof Date
                        ? row.tanggal_terbit.toISOString()
                        : new Date(row.tanggal_terbit).toISOString(),
                tanggal_lunas:
                    row.tanggal_lunas === null
                        ? null
                        : row.tanggal_lunas instanceof Date
                            ? row.tanggal_lunas.toISOString()
                            : new Date(row.tanggal_lunas).toISOString(),
                rekam_medis: {
                    id_rekam_medis: String(row.id_rekam_medis),
                    keluhan: row.keluhan,
                    diagnosa: row.diagnosa,
                    tanggal_periksa:
                        row.tanggal_periksa instanceof Date
                            ? row.tanggal_periksa.toISOString()
                            : new Date(row.tanggal_periksa).toISOString(),
                    pegawai: {
                        id_pegawai: String(row.id_pegawai),
                        nama_pegawai: row.nama_pegawai,
                        nomor_pegawai: row.nomor_pegawai,
                    },
                    tenaga_medis: {
                        id_tenaga_medis: String(row.id_tenaga_medis),
                        nama_tenaga_medis: row.nama_tenaga_medis,
                    },
                },
            }
            : null;

        // Revalidate both admin and medis kwitansi pages
        revalidatePath("/admin/kwitansi");
        revalidatePath("/medis/kwitansi");

        return NextResponse.json(
            { message: "Berhasil diperbarui", kwitansi },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error PUT Kwitansi:", error);
        return NextResponse.json(
            { message: "Gagal memperbarui data kwitansi" },
            { status: 500 }
        );
    }
}

// DELETE - Menghapus kwitansi
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_kwitansi = searchParams.get("id_kwitansi");

        if (!id_kwitansi) {
            return NextResponse.json(
                { message: "ID kwitansi tidak ditemukan" },
                { status: 400 }
            );
        }

        await prisma.$executeRaw`
            DELETE FROM "Kwitansi"
            WHERE id_kwitansi = ${String(id_kwitansi)}
        `;

        // Revalidate both admin and medis kwitansi pages
        revalidatePath("/admin/kwitansi");
        revalidatePath("/medis/kwitansi");

        return NextResponse.json(
            { message: "Kwitansi berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error DELETE Kwitansi:", error);
        return NextResponse.json(
            { message: "Gagal menghapus kwitansi" },
            { status: 500 }
        );
    }
}
