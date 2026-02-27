"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function DeletePenyakitButton({ id_penyakit }: { id_penyakit: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus penyakit ini?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/penyakit?id_penyakit=${id_penyakit}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus data penyakit.");
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
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
