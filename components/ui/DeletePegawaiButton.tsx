"use client";

import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function DeletePegawaiButton({ id_pegawai }: { id_pegawai: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus pegawai ini?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pegawai?id_pegawai=${id_pegawai}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus data pegawai.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash size={20} />
    </button>
  );
}
