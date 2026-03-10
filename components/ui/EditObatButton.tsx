'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

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

interface EditObatButtonProps {
  obat: Obat;
  onEdit: (obat: Obat) => void;
}

export default function EditObatButton({ obat, onEdit }: EditObatButtonProps) {
  const handleEdit = () => {
    onEdit(obat);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleEdit}>
      <Pencil className="h-4 w-4" />
    </Button>
  )
}
