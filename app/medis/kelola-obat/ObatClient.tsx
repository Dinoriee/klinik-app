'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import EditObatButton from "@/components/ui/EditObatButton"
import DeleteObatButton from "@/components/ui/DeleteObatButton" 
import { useSession } from "next-auth/react"
import UserAccount from "@/components/ui/userAccount"

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

interface ObatClientProps {
  obatList: Obat[];
  query: string;
}

export default function ObatClient({ obatList, query }: ObatClientProps) {
  
  const { data: session } = useSession()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(obatList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = obatList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 w-full relative">
      
      {}
      {}
      {}
      <div className="w-full flex justify-end mb-2">
        <UserAccount userName={session?.user?.name || "Pegawai Medis"} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">Daftar Obat</h2>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="text"
              placeholder="Cari nama atau batch obat..." 
              defaultValue={query} 
              className="pl-9 bg-white" 
            />
          </div>
          
          <Link href="/medis/kelola-obat/tambah">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> 
              <span>Tambah Obat</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Obat</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Expired</TableHead>
              <TableHead className="text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {}
            {currentData.length > 0 ? (
              currentData.map((obat) => (
                <TableRow key={obat.idObat}>
                  <TableCell className="font-medium text-gray-900">{obat.namaObat}</TableCell>
                  <TableCell>{obat.namaBatch}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${obat.stokSaatIni <= obat.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {obat.stokSaatIni} {obat.satuan}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(obat.expiredDate).toLocaleDateString('id-ID')}</TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 pr-2">
                      <EditObatButton obat={obat} />
                      <DeleteObatButton idObat={obat.idObat} /> 
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <p>Tidak ada data obat yang ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {}
      {}
      {}
      {obatList.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Menampilkan <span className="font-medium text-gray-900">{startIndex + 1}</span> - <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, obatList.length)}</span> dari <span className="font-medium text-gray-900">{obatList.length}</span> data
          </span>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium text-gray-700 px-2">
              Halaman {currentPage} / {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
