'use client'
import * as XLSX from 'xlsx';
import { Download, FileUp, X, FileText, UploadCloud, Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";

// Definisi antarmuka data untuk entitas Pegawai
interface ExcelPegawai {
  "Nomor Pegawai": string | number;
  "Nama Pegawai": string;
  "Departemen": string;
  "NIK": string | number;
}

const REQUIRED_HEADERS: (keyof ExcelPegawai)[] = [
  "Nomor Pegawai", 
  "Nama Pegawai", 
  "Departemen",
  "NIK"
];

export default function ImportPegawaiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processExcelData = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Konversi data Excel ke format JSON dengan pengaturan raw false untuk menjaga format string
        const allData = XLSX.utils.sheet_to_json<ExcelPegawai>(sheet, { raw: false });

        if (allData.length === 0) {
          alert("Berkas Excel tidak mengandung data.");
          return setIsProcessing(false);
        }

        // Validasi integritas struktur kolom header
        const firstRow = allData[0];
        const actualHeaders = Object.keys(firstRow);
        const isFormatValid = REQUIRED_HEADERS.every((h) => actualHeaders.includes(h));

        if (!isFormatValid) {
          alert("Struktur kolom tidak sesuai. Pastikan header mencakup: Nomor Pegawai, Nama Pegawai, Departemen, dan NIK.");
          return setIsProcessing(false);
        }

        setProgress({ current: 0, total: allData.length });

        // Proses transmisi data ke API secara sekuensial
        for (let i = 0; i < allData.length; i++) {
          const item = allData[i];

          const body = {
            nomor_pegawai: String(item["Nomor Pegawai"]),
            nama_pegawai: item["Nama Pegawai"],
            departemen: item["Departemen"],
            nik: String(item["NIK"]),
            id_pegawai: null // Mengindikasikan operasi pembuatan data baru (Create)
          };

          const res = await fetch('/api/pegawai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (!res.ok) {
            const error = await res.json();
            console.error(`Gagal mengimpor baris ${i + 1}:`, error.message);
          }

          setProgress((prev) => ({ ...prev, current: i + 1 }));
        }

        alert("Proses impor data pegawai berhasil diselesaikan.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Terjadi kegagalan sistem saat memproses berkas.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
      >
        <FileUp size={18} /> Impor Pegawai
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 text-gray-900">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 tracking-tight">Modul Impor Pegawai</h3>
              <button 
                disabled={isProcessing}
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3">
                <FileText className="text-emerald-600 mt-1" size={20} />
                <div className="flex-1 text-gray-900">
                  <p className="text-sm font-bold">Panduan Impor Pegawai</p>
                  <p className="text-xs text-emerald-700 mb-2">
                    Gunakan templat resmi untuk memastikan data NIK dan Nomor Pegawai terproses dengan benar.
                  </p>
                  <a href="/templates/template_pegawai.xlsx" download className="text-xs font-bold text-emerald-800 underline flex items-center gap-1 hover:text-emerald-900 transition-colors">
                    <Download size={14} /> Unduh Templat Pegawai
                  </a>
                </div>
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); !isProcessing && setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f && !isProcessing) processExcelData(f); }}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all 
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                  ${isProcessing ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls" 
                  onChange={(e) => e.target.files?.[0] && processExcelData(e.target.files[0])}
                  disabled={isProcessing}
                />
                
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="text-blue-600 animate-spin mb-3" size={32} />
                    <p className="text-sm font-bold text-gray-700">Sinkronisasi Data Pegawai...</p>
                    <p className="text-xs text-gray-500 mt-1">{progress.current} / {progress.total} Entri</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium text-center">Tarik berkas Excel ke area ini atau klik untuk memilih berkas secara manual</p>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  disabled={isProcessing}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}