"use client";

import React, { useState } from "react";
import UserAccount from "@/components/ui/userAccount";
import ScannerKonsultasiDokter from "@/components/ui/ScannerKonsultasiDokter";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cariPegawaiByNik, simpanRekamMedisAction } from "./actions";

interface Pegawai {
  id_pegawai: string;
  nama_pegawai: string;
  nik: string;
}

export default function KonsultasiDokterClient({ notifications }: { notifications: any[] }) {
  const { data: session } = useSession();
  const [manualNik, setManualNik] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasilPegawai, setHasilPegawai] = useState<Pegawai | null>(null);

  const [isSavingForm, setIsSavingForm] = useState(false);
  const [tahap, setTahap] = useState<"pencarian" | "konsultasi">("pencarian");

  const prosesCariNIK = async (nikYangDicari: string) => {
    if (!nikYangDicari) {
      toast.error("NIK tidak boleh kosong!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await cariPegawaiByNik(nikYangDicari);

      if (result.success && result.data) {
        setHasilPegawai(result.data);
        setManualNik("");
        toast.success(`Pegawai ditemukan: ${result.data.nama_pegawai}`);
      } else {
        toast.error(result.message || "Pegawai tidak ditemukan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mencari data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = (text: string) => {
    if (text) {
      let nikDariBarcode = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.nik) nikDariBarcode = String(parsed.nik);
        else if (parsed.id) nikDariBarcode = String(parsed.id);
      } catch (e) {
        // Biarkan teks mentah
      }

      prosesCariNIK(nikDariBarcode);
    }
  };

  const mulaiKonsultasi = () => setTahap("konsultasi");

  const batalkanKonsultasi = () => {
    setTahap("pencarian");
    setHasilPegawai(null);
    setManualNik("");
  };

  const simpanRekamMedis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.email) {
      toast.error("Email dokter tidak ditemukan di sesi login!");
      return;
    }

    if (!hasilPegawai) {
      toast.error("Data pegawai tidak tersedia!");
      return;
    }

    setIsSavingForm(true);

    try {
      const formData = new FormData(e.currentTarget);
      const dataKirim = {
        id_pegawai: hasilPegawai.id_pegawai,
        email_dokter: session.user.email,
        keluhan: formData.get("keluhan") as string,
        tensi: formData.get("tensi") as string,
        suhu: formData.get("suhu")
          ? parseFloat(formData.get("suhu") as string)
          : null,
        diagnosa: formData.get("diagnosa") as string,
        tindakan: formData.get("tindakan") as string,
        status_perawatan: formData.get("status_perawatan") as
          | "rawat_jalan"
          | "rawat_inap",
      };

      const result = await simpanRekamMedisAction(dataKirim);

      if (result.success) {
        toast.success(result.message || "Rekam medis berhasil disimpan!");
        batalkanKonsultasi();
      } else {
        toast.error(result.message || "Gagal menyimpan rekam medis.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSavingForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik /{" "}
            <span className="text-black font-bold">Konsultasi Dokter</span>
          </h1>
        </div>
        <UserAccount notifications={notifications} userName={session?.user?.name || "Pegawai Medis"} />
      </div>

      {tahap === "pencarian" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
          <div className="mb-4">
            <h2 className="font-bold text-gray-800 text-lg">
              Cari Data Pegawai
            </h2>
          </div>

          <div className="mb-8">
            <ScannerKonsultasiDokter onScanSuccess={handleScan} />
          </div>

          <h3 className="font-bold text-lg text-black mb-4">Input Manual</h3>
          <div className="flex gap-4 max-w-md">
            <input
              type="text"
              placeholder="Cari NIK..."
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={manualNik}
              onChange={(e) => setManualNik(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && prosesCariNIK(manualNik)}
              suppressHydrationWarning
            />
            <button
              onClick={() => prosesCariNIK(manualNik)}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-md font-medium transition duration-200 disabled:opacity-50"
              suppressHydrationWarning
            >
              {isLoading ? "Cari..." : "Cari"}
            </button>
          </div>
        </div>
      )}

      {hasilPegawai && tahap === "pencarian" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
          <div className="bg-green-50 p-4 border border-green-200 rounded-md mb-4">
            <h3 className="text-sm font-bold text-green-800 mb-2">
              Pegawai Ditemukan!
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Nama:</span>{" "}
                {hasilPegawai.nama_pegawai}
              </p>
              <p>
                <span className="font-semibold">NIK:</span> {hasilPegawai.nik}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={mulaiKonsultasi}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-md font-medium transition duration-200"
              suppressHydrationWarning
            >
              Mulai Konsultasi
            </button>
            <button
              onClick={batalkanKonsultasi}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 text-sm rounded-md font-medium transition duration-200"
              suppressHydrationWarning
            >
              Ganti Pegawai
            </button>
          </div>
        </div>
      )}

      {tahap === "konsultasi" && hasilPegawai && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
          <div className="bg-blue-50 p-4 border border-blue-200 rounded-md mb-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                Data Pegawai
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {hasilPegawai.nama_pegawai}
              </p>
              <p className="text-sm text-gray-600">NIK: {hasilPegawai.nik}</p>
            </div>
            <button
              onClick={batalkanKonsultasi}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-md font-medium transition duration-200"
              suppressHydrationWarning
            >
              Ganti Pegawai
            </button>
          </div>

          <form onSubmit={simpanRekamMedis} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keluhan Utama
              </label>
              <textarea
                name="keluhan"
                placeholder="Contoh: Demam, pusing..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                rows={3}
                required
                suppressHydrationWarning
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tekanan Darah (mmHg)
                </label>
                <input
                  type="text"
                  name="tensi"
                  placeholder="Contoh: 120/80"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suhu Tubuh (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="suhu"
                  placeholder="Contoh: 37.5"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosa Awal
              </label>
              <input
                type="text"
                name="diagnosa"
                placeholder="Masukkan hasil diagnosa..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tindakan / Pemberian Obat
              </label>
              <textarea
                name="tindakan"
                placeholder="Catat tindakan atau resep obat di sini..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                rows={3}
                suppressHydrationWarning
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-bold text-red-600 mb-2">
                Tentukan Status Perawatan Pegawai
              </label>
              <select
                name="status_perawatan"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                required
                suppressHydrationWarning
              >
                <option value="rawat_jalan">Rawat Jalan (Biasa)</option>
                <option value="rawat_inap">Rawat Inap (Otomatis Buat Kwitansi)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={isSavingForm}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm rounded-md font-medium transition duration-200 disabled:opacity-50"
                suppressHydrationWarning
              >
                {isSavingForm ? "Menyimpan..." : "Simpan Rekam Medis"}
              </button>
              <button
                type="button"
                onClick={batalkanKonsultasi}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 text-sm rounded-md font-medium transition duration-200"
                suppressHydrationWarning
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
