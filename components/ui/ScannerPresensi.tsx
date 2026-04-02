"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { usePathname } from 'next/navigation';

// interface TenagaMedis{
//     id_tenaga_medis: string;
//     nama_tenaga_medis: string;
//     nik: string;
// }

// interface Pegawai{
//     id_pegawai: string;
//     nama_pegawai: string;
//     nik: string;
// }

type person = {id_pegawai?: string; id_tenaga_medis?: string; nama_pegawai?: string; nama_tenaga_medis?: string; nik: string}
type AttendanceType = "presensi" | "istirahat-sakit" | "laktasi" | "istirahat-hamil";

export default function KlinikScanner({dataUser} : {dataUser: person[]}) {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  const attendanceType = useMemo<AttendanceType>(() => {
    if (pathname.includes("istirahat-sakit")) return "istirahat-sakit";
    if (pathname.includes("laktasi")) return "laktasi";
    if (pathname.includes("presensi")) return "presensi";
    return "istirahat-hamil";
  }, [pathname]);

  const handleScan = useCallback(async (text: string) => {
    if (!active) return;
    setActive(false);

    let nik = text;
    try {
      const barcodeData = JSON.parse(text);
      nik = String(barcodeData?.nik ?? barcodeData?.id ?? text);
    } catch {
      nik = String(text);
    }

    nik = nik.trim();
    if (!nik) {
      toast.error("Barcode tidak berisi NIK.");
      setTimeout(() => setActive(true), 1500);
      return;
    }

    try {
      setSelectedId(nik);
      const res = await fetch(`/api/tenaga-medis/${attendanceType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik })
      });

      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.message);
    } catch (e) {
      console.log(nik, e);
      toast.error("Barcode tidak valid");
    }

    setTimeout(() => setActive(true), 1500);
  }, [active, attendanceType]);

  const handleSubmit = async(e: React.FormEvent) => {
      e.preventDefault();
    
      if(!selectedId) return toast.error("Masukkan data yang valid!");
      console.log(selectedId);
        const selectedPerson = dataUser.find(t => t.nik === selectedId);
        const nama = selectedPerson ? (selectedPerson.nama_tenaga_medis || selectedPerson.nama_pegawai) : "Unknown";

        const res = await fetch(`/api/tenaga-medis/${attendanceType}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                nama: nama,
                nik: selectedId,
            })
        });

        const data = await res.json();

        if(res.ok){
            toast.success(data.message);
            console.log(data.message);
            setTimeout(() => window.location.reload(), 1500);
        }else{
            console.log("Gagal Absen");
            console.log({selectedId});
            toast.error(data.message);
        }
    };

  useEffect(() => {
  const hints = new Map();
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODABAR,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.ITF,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
    BarcodeFormat.PDF_417,
  ]);

  const codeReader = new BrowserMultiFormatReader(hints, 200);

  codeReader.listVideoInputDevices()
    .then((devices) => {
      const preferredDevice =
        devices.find((d) => /back|rear|environment/i.test(d.label)) ??
        (devices.length > 1 ? devices[1] : undefined) ??
        devices[0];
      const deviceId = preferredDevice?.deviceId;
      
      if (deviceId && videoRef.current) {
        codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result) => {
          if (result && active) handleScan(result.getText());
        });
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Kamera tidak terdeteksi");
      setLoading(false);
    });

  return () => codeReader.reset();
}, [active, handleScan]);

  return (
    <div>
      <div className="relative border-8 border-gray-800 rounded-2xl overflow-hidden bg-black max-h-96 shadow-2xl">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20 text-white">
            <PuffLoader color="#3B82F6" size={50} />
            <p className="mt-4 font-mono text-sm animate-pulse">INITIALIZING...</p>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          className="w-full h-auto object-cover" 
        />
        <canvas ref={canvasRef} className="hidden" />

        {active && !loading && (
          <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_red] opacity-70 animate-bounce z-10" />
        )}

        {!active && !loading && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
            <p className="bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold">
              SUCCESS - PLEASE WAIT...
            </p>
          </div>
        )}
      </div>
      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
            <span className="text-2xl font-bold">Presensi Manual</span>
            <div className="flex space-x-4">
              <Combobox
        items={dataUser}
        value={selectedId}
        onValueChange={(val) => {
                                      const found = dataUser.find(t => t.nik === val);
                                      if (found) setSelectedId(found.nik)}} 
      //   itemToStringValue={}
      >
        <ComboboxInput placeholder="Cari NIK anda..." onChange={(e) => setSelectedId(e.target.value)}/>
        <ComboboxContent>
          <ComboboxEmpty>NIK tidak ditemukan</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.nik} value={item.nik}>
                <Item size="sm" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {item.nama_tenaga_medis || item.nama_pegawai}
                    </ItemTitle>
                    <ItemDescription>
                      {item.nik}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
              <button className="bg-blue-400 text-white rounded-md w-32">Presensi</button>
            </div>
          </form>
    </div>
  );
}
