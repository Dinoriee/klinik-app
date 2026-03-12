'use client'

import React, { useState } from 'react'
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function DeleteObatButton({ id_obat }: { id_obat: number | string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus obat ini?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/obat?id_obat=${id_obat}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Obat berhasil dihapus')
        router.refresh()
      } else {
        toast.error('Gagal menghapus data obat')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash size={20} />
    </button>
  )
}
