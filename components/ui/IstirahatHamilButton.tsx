'use client'
import { X } from "lucide-react";
import React, { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox";
import { toast } from "sonner";

interface TenagaMedis {
  id_tenaga_medis: number;
  nama_tenaga_medis: string;
}

export default function IstirahatHamilButton({ tenagaMedis }: { tenagaMedis: TenagaMedis[] }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedId) return toast.error("Masukkan data yang valid!");

    const selectedPerson = tenagaMedis.find((t) => t.id_tenaga_medis === Number(selectedId));
    const nama = selectedPerson ? selectedPerson.nama_tenaga_medis : "Unknown";

    const res = await fetch('/api/tenaga-medis/istirahat-hamil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_tenaga_medis: selectedId,
        nama,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setModalOpen(false);
      toast.success(data.message);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(data.message || "Gagal memproses istirahat hamil.");
    }
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-pink-500 hover:bg-pink-600 min-w-44 h-8 rounded-md transition-colors duration-200 text-white"
      >
        Istirahat Hamil
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg min-w-96">
            <div className="flex justify-between items-center">
              <span className="font-bold mb-4 flex items-center">Form Istirahat Hamil</span>
              <X size={22} className="text-gray-600 cursor-pointer" onClick={() => setModalOpen(false)} />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-2">
                <label htmlFor="tenaga-medis">Tenaga Medis</label>
                <Combobox
                  items={tenagaMedis}
                  onValueChange={(val) => {
                    const found = tenagaMedis.find((t) => t.nama_tenaga_medis === val);
                    if (found) setSelectedId(found.id_tenaga_medis.toString());
                  }}
                >
                  <ComboboxInput placeholder="Pilih Tenaga Medis" />
                  <ComboboxContent>
                    <ComboboxEmpty>Tenaga medis tidak ditemukan</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.id_tenaga_medis} value={item.nama_tenaga_medis}>
                          {item.nama_tenaga_medis}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="flex justify-end mt-4 space-x-4">
                <button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
