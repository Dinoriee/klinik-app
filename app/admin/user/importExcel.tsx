'use client'
import * as XLSX from 'xlsx';
import { Download, FileUp, X, FileText, UploadCloud, Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";

interface ExcelUser {
  Kode: string | number;
  NIK: string | number;
  Nama: string;
  Jabatan: string;
  Role: string;
  Email: string;
  Password: string | number;
}

const REQUIRED_HEADERS: (keyof ExcelUser)[] = [
  "Kode", "NIK", "Nama", "Jabatan", "Role", "Email", "Password"
];

export default function ImportUserModal() {
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
      // Menggunakan ArrayBuffer untuk kompatibilitas yang lebih baik
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Konversi ke format JSON
      // raw: false memastikan nilai seperti NIK tidak berubah menjadi notasi ilmiah
      const allData = XLSX.utils.sheet_to_json<ExcelUser>(sheet, { raw: false });

      if (allData.length === 0) {
        alert("Berkas terdeteksi kosong atau format data tidak dikenali.");
        return setIsProcessing(false);
      }

      // Validasi struktur header berdasarkan baris pertama data yang dihasilkan
      const firstRow = allData[0];
      const actualHeaders = Object.keys(firstRow);
      const isFormatValid = REQUIRED_HEADERS.every((h) => actualHeaders.includes(h));

      if (!isFormatValid) {
        alert("Struktur kolom tidak sesuai. Pastikan header pada Excel sama persis dengan templat.");
        return setIsProcessing(false);
      }

      setProgress({ current: 0, total: allData.length });

      // Proses pengiriman data ke API
      for (let i = 0; i < allData.length; i++) {
        const item = allData[i];
        const roleRaw = String(item.Role).toLowerCase();
        
        let endpoint = "";
        let body = {};

        if (['dokter', 'perawat'].includes(roleRaw)) {
          endpoint = "/api/tenaga-medis";
          body = {
            kode_tenaga_medis: String(item.Kode),
            nama_tenaga_medis: item.Nama,
            jabatan: item.Jabatan,
            nik: String(item.NIK),
            email: item.Email,
            password: String(item.Password),
            role: roleRaw
          };
        } else {
          endpoint = "/api/users/CRUD";
          body = {
            name: item.Nama,
            email: item.Email,
            password: String(item.Password),
            role: "admin"
          };
        }

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        setProgress((prev) => ({ ...prev, current: i + 1 }));
      }

      alert("Proses impor data selesai dikerjakan.");
      window.location.reload();
    } catch (error) {
      console.error("Detail Error:", error);
      alert("Terjadi kegagalan saat memproses berkas Excel.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Pastikan menggunakan readAsArrayBuffer
  reader.readAsArrayBuffer(file);
};

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
      >
        <FileUp size={18} /> Impor Data Pengguna
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-gray-900">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Panel Impor Data Excel</h3>
              <button 
                disabled={isProcessing}
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start gap-3">
                <FileText className="text-blue-600 mt-1" size={20} />
                <div className="flex-1 text-gray-900">
                  <p className="text-sm font-bold">Instruksi Impor Data</p>
                  <p className="text-xs text-slate-500 mb-2">
                    Sistem akan otomatis mendaftarkan Dokter/Perawat ke tabel Tenaga Medis, sedangkan peran lainnya akan didaftarkan sebagai Admin.
                  </p>
                  <a href="/templates/template_user.xlsx" download className="text-xs font-bold text-blue-600 underline flex items-center gap-1">
                    <Download size={14} /> Download_Template_User.xlsx
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
                  <div className="flex flex-col items-center text-gray-900">
                    <Loader2 className="text-blue-600 animate-spin mb-3" size={32} />
                    <p className="text-sm font-bold">Sinkronisasi Data...</p>
                    <p className="text-xs text-gray-500 mt-1">{progress.current} / {progress.total} Entri</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium text-center">Tarik berkas ke area ini atau klik untuk memilih secara manual</p>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  disabled={isProcessing}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30"
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