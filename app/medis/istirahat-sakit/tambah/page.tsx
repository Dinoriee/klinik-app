'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cariPegawaiByNik, catatIstirahatSakit } from './actions'
import Scanner from '@/components/ui/Scanner' 

import { useSession } from "next-auth/react"
import UserAccount from '@/components/ui/userAccount' 

export default function TambahIstirahatSakitPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [nik, setNik] = useState('')
  const [isScanning, setIsScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingSakit, setLoadingSakit] = useState(false)
  const [hasilPegawai, setHasilPegawai] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const prosesCariNIK = async (nikYangDicari: string) => {
    setLoading(true)
    setErrorMsg('')
    setHasilPegawai(null)

    const result = await cariPegawaiByNik(nikYangDicari)

    if (result.success) {
      setHasilPegawai(result.data)
    } else {
      setErrorMsg(result.message || "Gagal mencari data.")
    }
    setLoading(false)
  }

  const handleScan = (text: string) => {
    if (text) {
      let nikDariBarcode = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.nik) nikDariBarcode = String(parsed.nik);
        else if (parsed.id) nikDariBarcode = String(parsed.id); 
      } catch(e) {}

      setNik(nikDariBarcode)
      setIsScanning(false)
      prosesCariNIK(nikDariBarcode)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nik) return alert('NIK tidak boleh kosong!')
    prosesCariNIK(nik)
  }

  const handleIstirahatSakit = async () => {
    if (!hasilPegawai || !hasilPegawai.id_pegawai) return;

    const konfirmasi = confirm(`Tandai ${hasilPegawai.nama_pegawai || hasilPegawai.nama} sebagai Istirahat Sakit hari ini?`);
    if (!konfirmasi) return;

    setLoadingSakit(true);
    const result = await catatIstirahatSakit(hasilPegawai.id_pegawai);

    if (result.success) {
      alert(result.message);
      router.push('/medis/istirahat-sakit') // Kembali ke tabel setelah sukses
    } else {
      alert(result.message);
    }
    setLoadingSakit(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      
      <div className="w-full flex justify-end mb-4">
        <UserAccount userName={session?.user?.name || "Medis"} />
      </div>

      <div className="flex justify-center items-start flex-1">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-xl p-6 border border-gray-100">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Catat Istirahat Sakit</h1>
            <p className="text-sm text-gray-500 mt-1">
              Scan Barcode / ID Card Pegawai untuk mencatat presensi sakit
            </p>
          </div>

          <Tabs defaultValue="scan" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="scan" onClick={() => setIsScanning(true)}>Scan Barcode</TabsTrigger>
                <TabsTrigger value="manual" onClick={() => setIsScanning(false)}>Input Manual</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="scan">
              <div className="flex flex-col items-center justify-center w-full">
                {isScanning ? (
                  <Scanner onScanSuccess={(text) => handleScan(text)} />
                ) : (
                  <div className="text-center py-8 w-full max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-green-600 font-semibold mb-2">Scan Berhasil!</p>
                    <p className="text-gray-700 text-lg font-mono bg-gray-200 px-4 py-2 rounded mb-4 inline-block">{nik}</p>
                    <br/>
                    <Button variant="outline" onClick={() => { setNik(''); setIsScanning(true); setHasilPegawai(null); setErrorMsg(''); }}>
                      Scan Ulang
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="manual">
              <div className="p-6 max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
                    <Input 
                      id="nik" type="text" placeholder="Masukkan NIK..." 
                      value={nik} onChange={(e) => setNik(e.target.value)} required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Mencari...' : 'Cari Data Pegawai'}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 max-w-md mx-auto">
            {loading && <p className="text-center text-sm text-blue-600 animate-pulse">Sedang memeriksa database...</p>}
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-center">
                <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
              </div>
            )}

            {hasilPegawai && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-sm font-bold text-green-800 border-b border-green-200 pb-2 mb-2">Pegawai Ditemukan!</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-semibold">Nama:</span> {hasilPegawai.nama || hasilPegawai.nama_pegawai}</p>
                  <p><span className="font-semibold">NIK:</span> {hasilPegawai.nik}</p>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push('/medis/istirahat-sakit')}
                  >
                    Batal
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleIstirahatSakit}
                    disabled={loadingSakit}
                  >
                    {loadingSakit ? 'Menyimpan...' : 'Konfirmasi Sakit'}
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
