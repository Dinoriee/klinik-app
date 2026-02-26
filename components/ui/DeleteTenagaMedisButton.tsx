'use client'
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function DeleteTenagaMedisButton({ id_tenaga_medis }: { id_tenaga_medis: number }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Yakin ingin menghapus tenaga medis ini? (Akun login-nya juga akan terhapus)")) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tenaga-medis?id_tenaga_medis=${id_tenaga_medis}`, { 
                method: "DELETE" 
            });
            
            if (res.ok) router.refresh();
            else alert("Gagal menghapus data tenaga medis.");
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