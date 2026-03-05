'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

// Sesuaikan interface agar menerima idObat berupa string
interface DeleteObatProps {
  idObat: string; 
}

export default function DeleteObatButton({ idObat }: DeleteObatProps) {
  const handleDelete = () => {
    // Logika delete Anda di sini, pastikan menggunakan idObat (string)
    console.log("Menghapus obat dengan ID:", idObat);
  };

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}