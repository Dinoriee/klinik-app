"use client";

import { X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Penyakit = {
  id_penyakit: number;
  nama_penyakit: string;
};

export default function EditPenyakitButton({ penyakit }: { penyakit: Penyakit }) {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [namaPenyakit, setNamaPenyakit] = useState(penyakit.nama_penyakit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/penyakit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_penyakit: penyakit.id_penyakit,
        nama_penyakit: namaPenyakit,
      }),
    });

    if (res.ok) {
      setModalOpen(false);
      router.refresh();
    } else {
      alert("Gagal menyimpan perubahan data penyakit");
    }

    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
      >
        Edit
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg text-gray-900">Form Edit Penyakit</span>
              <X
                size={22}
                className="text-gray-600 cursor-pointer hover:text-red-500"
                onClick={() => setModalOpen(false)}
              />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Nama Penyakit</label>
                <input
                  type="text"
                  required
                  className="border rounded-md h-9 p-2 text-sm focus:outline-blue-400"
                  value={namaPenyakit}
                  onChange={(e) => setNamaPenyakit(e.target.value)}
                />
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-md transition duration-200 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
