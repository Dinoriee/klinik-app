'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteObatProps {
  idObat: number | string; 
  onDelete: (idObat: number | string) => void;
}

export default function DeleteObatButton({ idObat, onDelete }: DeleteObatProps) {
  const handleDelete = () => {
    onDelete(idObat);
  };

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
