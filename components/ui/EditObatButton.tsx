'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Pencil, SquarePen } from "lucide-react"

interface Obat {
  idObat: number | string; 
  namaObat: string;
  namaBatch: string;
  jenisObat: string;
  stokSaatIni: number;
  satuan: string;
  expiredDate: string;
  reorderLevel: number;
}

export default function EditObatButton({ obat }: { obat: Obat }) {
  const handleEdit = () => {
    console.log("Editing obat ID:", obat.idObat);
    // Nanti masukkan logika modal/edit di sini
  };

  return (
    <button onClick={handleEdit}>
      <SquarePen className="h-4 w-4 text-yellow-400"/>
    </button>
  )
}
