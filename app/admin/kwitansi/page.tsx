import { Suspense } from "react";
import KwitansiClient from "./KwitansiClient";

interface Kwitansi {
    id_kwitansi: string;
    id_rekam_medis: string;
    total_biaya: number | null;
    status: "belum_lunas" | "lunas";
    tanggal_terbit: string;
    tanggal_lunas: string | null;
    rekam_medis: {
        id_rekam_medis: string;
        keluhan: string;
        diagnosa: string;
        tanggal_periksa: string;
        pegawai: {
            id_pegawai: string;
            nama_pegawai: string;
            nomor_pegawai: string;
        };
        tenaga_medis: {
            id_tenaga_medis: string;
            nama_tenaga_medis: string;
        };
    };
}

export default async function KwitansiPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; status?: string }>;
}) {
    const params = await searchParams;
    const query = params.query || "";
    const status = params.status || "";

    const urlParams = new URLSearchParams();
    if (query) urlParams.set("query", query);
    if (status) urlParams.set("status", status);

    let kwitansiList: Kwitansi[] = [];

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/kwitansi?${urlParams.toString()}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );

        if (response.ok) {
            kwitansiList = await response.json();
        }
    } catch (error) {
        console.error("Error fetching kwitansi:", error);
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KwitansiClient kwitansiList={kwitansiList} query={query} status={status} />
        </Suspense>
    );
}
