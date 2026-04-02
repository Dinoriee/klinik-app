import prisma from "@/lib/db"; 
import KonsultasiAdminClient from "./KonsultasiAdminClient";

function padDateTimePart(value: number) {
    return value.toString().padStart(2, "0");
}

function serializeDatabaseDateTime(value: Date | string) {
    if (value instanceof Date) {
        return `${value.getUTCFullYear()}-${padDateTimePart(value.getUTCMonth() + 1)}-${padDateTimePart(value.getUTCDate())} ${padDateTimePart(value.getUTCHours())}:${padDateTimePart(value.getUTCMinutes())}:${padDateTimePart(value.getUTCSeconds())}`;
    }

    return String(value)
        .trim()
        .replace("T", " ")
        .replace(/Z$/, "")
        .slice(0, 19);
}

export default async function AdminKonsultasiPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const query = (resolvedSearchParams.query || "").trim();

    // The generated Prisma Client in this repo can be out-of-sync (missing `rekam_Medis` model).
    // Use raw SQL to keep the admin page working.
    type RekamRow = {
        id_rekam_medis: string;
        tanggal_periksa: Date | string;
        keluhan: string;
        tensi: string | null;
        suhu: number | null;
        diagnosa: string;
        tindakan: string | null;
        status_perawatan: string;
        pegawai_nama: string | null;
        pegawai_nik: string | null;
        dokter_nama: string | null;
    };

    const like = `%${query}%`;
    let rekamList: RekamRow[] = [];
    let isRekamMedisTableMissing = false;
    try {
        rekamList = await prisma.$queryRaw<RekamRow[]>`
            SELECT
                CAST(r.id_rekam_medis AS TEXT) AS id_rekam_medis,
                r.tanggal_periksa,
                r.keluhan,
                r.tensi,
                r.suhu,
                r.diagnosa,
                r.tindakan,
                CAST(r.status_perawatan AS TEXT) AS status_perawatan,
                p.nama_pegawai AS pegawai_nama,
                CAST(p.nik AS TEXT) AS pegawai_nik,
                t.nama_tenaga_medis AS dokter_nama
            FROM "Rekam_Medis" r
            LEFT JOIN "Pegawai" p ON p.id_pegawai = r.id_pegawai
            LEFT JOIN "Tenaga_Medis" t ON t.id_tenaga_medis = r.id_tenaga_medis
            WHERE
                p.nama_pegawai ILIKE ${like}
                OR t.nama_tenaga_medis ILIKE ${like}
                OR r.diagnosa ILIKE ${like}
            ORDER BY r.tanggal_periksa DESC
        `;
    } catch (error) {
        const pgCode = (error as any)?.meta?.code;
        if (pgCode === "42P01") {
            // Postgres: undefined_table. Avoid surfacing as a hard Next.js error overlay.
            // Try a lowercase fallback (common when tables were created without quoting).
            isRekamMedisTableMissing = true;
            try {
                rekamList = await prisma.$queryRaw<RekamRow[]>`
                    SELECT
                        CAST(r.id_rekam_medis AS TEXT) AS id_rekam_medis,
                        r.tanggal_periksa,
                        r.keluhan,
                        r.tensi,
                        r.suhu,
                        r.diagnosa,
                        r.tindakan,
                        CAST(r.status_perawatan AS TEXT) AS status_perawatan,
                        p.nama_pegawai AS pegawai_nama,
                        CAST(p.nik AS TEXT) AS pegawai_nik,
                        t.nama_tenaga_medis AS dokter_nama
                    FROM rekam_medis r
                    LEFT JOIN pegawai p ON p.id_pegawai = r.id_pegawai
                    LEFT JOIN tenaga_medis t ON t.id_tenaga_medis = r.id_tenaga_medis
                    WHERE
                        p.nama_pegawai ILIKE ${like}
                        OR t.nama_tenaga_medis ILIKE ${like}
                        OR r.diagnosa ILIKE ${like}
                    ORDER BY r.tanggal_periksa DESC
                `;
                isRekamMedisTableMissing = false;
            } catch {
                rekamList = [];
            }
        } else {
            console.error("Error fetching rekam medis:", error);
            rekamList = [];
        }
    }

    const notifications = await prisma.notifikasi.findMany({
        include: {
            obat: { select: { nama_obat: true } }
        },
        orderBy: { id_notifikasi: 'desc' }
    });

    const serializedRekam = rekamList.map((rekam) => ({
        id_rekam_medis: String(rekam.id_rekam_medis),
        tanggal_periksa: serializeDatabaseDateTime(rekam.tanggal_periksa),
        keluhan: rekam.keluhan,
        tensi: rekam.tensi,
        suhu: rekam.suhu,
        diagnosa: rekam.diagnosa,
        tindakan: rekam.tindakan,
        status_perawatan: rekam.status_perawatan,
        pegawai: {
            nama_pegawai: rekam.pegawai_nama || "-",
            nik: rekam.pegawai_nik || "-",
        },
        tenaga_medis: {
            nama_tenaga_medis: rekam.dokter_nama || "-",
        },
    }));

    return (
        <KonsultasiAdminClient
            rekamList={serializedRekam}
            query={query}
            notifications={notifications}
            isRekamMedisTableMissing={isRekamMedisTableMissing}
        />
    );
}
