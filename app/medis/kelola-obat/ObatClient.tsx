'use client'

import React, { useState } from 'react'
import { Plus, Search, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import UserAccount from "@/components/ui/userAccount"

interface Obat {
  idObat: string | number;
  namaObat: string;
  namaBatch: string;
  jenisObat: string;
  stokSaatIni: number;
  satuan: string;
  expiredDate: string;
  reorderLevel: number;
}

interface ObatClientProps {
  obatList: Obat[];
  query: string;
}

export default function ObatClient({ obatList, query }: ObatClientProps) {
  
  const { data: session } = useSession()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 5

  // Form state
  const [namaObat, setNamaObat] = useState("")
  const [namaBatch, setNamaBatch] = useState("")
  const [jenisObat, setJenisObat] = useState("tablet")
  const [satuan, setSatuan] = useState("")
  const [stok, setStok] = useState("")
  const [reorderLevel, setReorderLevel] = useState("")
  const [expiredDate, setExpiredDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/obat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_obat: namaObat,
          nama_batch: namaBatch,
          jenis_obat: jenisObat,
          satuan: satuan,
          stok_saat_ini: parseInt(stok),
          reorder_level: parseInt(reorderLevel),
          expired_date: expiredDate
        })
      })

      if (res.ok) {
        setModalOpen(false)
        // Reset form
        setNamaObat("")
        setNamaBatch("")
        setJenisObat("tablet")
        setSatuan("")
        setStok("")
        setReorderLevel("")
        setExpiredDate("")
        router.refresh()
      } else {
        alert("Gagal menyimpan data obat")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(obatList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = obatList.slice(startIndex, startIndex + itemsPerPage)

  const formatTanggal = (tanggalString: string) => {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(tanggalString))
  }

  return (
    <div className="flex flex-col gap-4 relative">
      
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-black">Klinik / Obat / <span className="text-white font-bold">Kelola Obat</span></h1>
        </div>
        <UserAccount userName={session?.user?.name || "Pegawai Medis"} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mx-4 mb-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="font-bold text-lg text-black">Daftar Obat</h2>
          <div className="flex space-x-3">
            <form method="GET" className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input 
                type="text" name="query" defaultValue={query}
                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
                placeholder="Cari nama atau batch obat..."
              />
              <button type="submit" className="hidden">Cari</button>
            </form>
            
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Tambah Obat
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-y text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nama Obat</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Batas Reorder</th>
                <th className="px-4 py-3 font-medium">Expired</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentData.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Tidak ada data obat.</td></tr>
              ) : (
                currentData.map((obat, index) => {
                  const actualNumber = startIndex + index + 1
                  return (
                    <tr key={obat.idObat} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{actualNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{obat.namaObat}</td>
                      <td className="px-4 py-3 text-gray-600">{obat.namaBatch}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{obat.jenisObat}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${obat.stokSaatIni <= obat.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {obat.stokSaatIni} {obat.satuan}
                        </span>
                      </td>
                      <td className="px-4 py-3">{obat.reorderLevel}</td>
                      <td className="px-4 py-3">{formatTanggal(obat.expiredDate)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {obatList.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(startIndex + itemsPerPage, obatList.length)}</span> dari <span className="font-semibold text-gray-900">{obatList.length}</span> data
            </span>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-sm font-medium text-gray-700 px-4">
                Halaman {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Form Tambah Obat</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Nama Obat</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={namaObat}
                    onChange={(e) => setNamaObat(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Nomor Batch</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={namaBatch}
                    onChange={(e) => setNamaBatch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Jenis Obat</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={jenisObat}
                    onChange={(e) => setJenisObat(e.target.value)}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="kapsul">Kapsul</option>
                    <option value="sirup">Sirup</option>
                    <option value="salep">Salep</option>
                    <option value="injeksi">Injeksi</option>
                    <option value="tetes">Tetes</option>
                    <option value="puyer">Puyer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Satuan</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Cth: Strip, Botol"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Stok Awal</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Batas Reorder</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Tanggal Expired</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Obat"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
