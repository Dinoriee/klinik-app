'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cariPegawaiByNik, simpanRekamMedisAction } from './actions'
import Scanner from '@/components/ui/Scanner' 

import { useSession } from "next-auth/react"
import UserAccount from '@/components/ui/userAccount' 

export default function KonsultasiDokterPage() {
  const { data: session } = useSession()

  const [nik, setNik] = useState('')
  const [isScanning, setIsScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isSavingForm, setIsSavingForm] = useState(false)

  const [hasilPegawai, setHasilPegawai] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [tahap, setTahap] = useState<'pencarian' | 'konsultasi'>('pencarian')

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

  const mulaiKonsultasi = () => setTahap('konsultasi')
  
  const batalkanKonsultasi = () => {
    setTahap('pencarian')
    setHasilPegawai(null)
    setNik('')
    setIsScanning(true)
  }

  const simpanRekamMedis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!session?.user?.email) {
      return alert("Gagal: Email dokter tidak ditemukan di sesi login!");
    }

    setIsSavingForm(true);

    const formData = new FormData(e.currentTarget);
    const dataKirim = {
      id_pegawai: hasilPegawai.id_pegawai,
      email_dokter: session.user.email,
      keluhan: formData.get('keluhan') as string,
      tensi: formData.get('tensi') as string,
      suhu: formData.get('suhu') ? parseFloat(formData.get('suhu') as string) : null,
      diagnosa: formData.get('diagnosa') as string,
      tindakan: formData.get('tindakan') as string,
      status_perawatan: formData.get('status_perawatan') as 'rawat_jalan' | 'rawat_inap'
    };

    const result = await simpanRekamMedisAction(dataKirim);

    if (result.success) {
      alert(result.message);
      batalkanKonsultasi(); 
    } else {
      alert(result.message);
    }

    setIsSavingForm(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      
      <div className="w-full flex justify-end mb-4">
        <UserAccount userName={session?.user?.name || "Pegawai Medis"} />
      </div>

      <div className="flex justify-center items-start flex-1">
        <div className={`w-full transition-all duration-300 ${tahap === 'konsultasi' ? 'max-w-2xl' : 'max-w-5xl'} bg-white shadow-md rounded-xl p-6 border border-gray-100`}>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Konsultasi Dokter</h1>
            <p className="text-sm text-gray-500 mt-1">
              {tahap === 'pencarian' ? 'Scan Barcode / ID Card Pegawai' : 'Formulir Pemeriksaan Medis'}
            </p>
          </div>

          {tahap === 'pencarian' && (
            <>
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
                          id="nik" 
                          type="text"
                          placeholder="Masukkan NIK..." 
                          value={nik}
                          onChange={(e) => setNik(e.target.value)}
                          required
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
                      <p><span className="font-semibold">Nama:</span> {hasilPegawai.nama || hasilPegawai.nama_pegawai || 'Nama tidak tersedia'}</p>
                      <p><span className="font-semibold">NIK:</span> {hasilPegawai.nik}</p>
                    </div>
                    
                    {}
                    <div className="mt-4">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={mulaiKonsultasi} 
                      >
                        Mulai Konsultasi
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {tahap === 'konsultasi' && hasilPegawai && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-50 p-4 rounded-lg mb-6 flex justify-between items-center border border-blue-100">
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Data Pasien</p>
                  <p className="text-lg font-semibold text-gray-800">{hasilPegawai.nama || hasilPegawai.nama_pegawai}</p>
                  <p className="text-sm text-gray-600">NIK: {hasilPegawai.nik}</p>
                </div>
                <Button variant="outline" size="sm" onClick={batalkanKonsultasi} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  Batal / Ganti Pasien
                </Button>
              </div>

              <form onSubmit={simpanRekamMedis} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="keluhan">Keluhan Utama</Label>
                  <textarea id="keluhan" name="keluhan" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Contoh: Demam, pusing..." required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="tensi">Tekanan Darah (mmHg)</Label>
                    <Input id="tensi" name="tensi" type="text" placeholder="Contoh: 120/80" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suhu">Suhu Tubuh (°C)</Label>
                    <Input id="suhu" name="suhu" type="number" step="0.1" placeholder="Contoh: 37.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosa">Diagnosa Awal</Label>
                  <Input id="diagnosa" name="diagnosa" type="text" placeholder="Masukkan hasil diagnosa..." required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tindakan">Tindakan / Pemberian Obat</Label>
                  <textarea id="tindakan" name="tindakan" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Catat tindakan atau resep obat di sini..." />
                </div>

                <div className="space-y-2 border-t pt-4 mt-2">
                  <Label htmlFor="status_perawatan" className="text-red-600 font-semibold">Tentukan Status Perawatan Pasien</Label>
                  <select 
                    id="status_perawatan" 
                    name="status_perawatan" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="rawat_jalan">Rawat Jalan (Biasa)</option>
                    <option value="rawat_inap">Rawat Inap (Otomatis Buat Kwitansi)</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSavingForm}>
                    {isSavingForm ? "Menyimpan Data..." : "Simpan Rekam Medis"}
                  </Button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}