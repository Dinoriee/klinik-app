"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

interface TenagaMedis{
    id_tenaga_medis: number;
    nama_tenaga_medis: string;
}

export default function KlinikScanner({tenagaMedis} : {tenagaMedis: TenagaMedis[]}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);

  const handleScan = async (text: string) => {
    if (!active) return;
    setActive(false);
    const barcodeData = JSON.parse(text);

      const id = barcodeData.id;
    console.log("Data barcode: ", text);


    try {
      const res = await fetch('/api/tenaga-medis/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_tenaga_medis: id, keterangan: "hadir" })
      });

      const data = await res.json();
      res.ok ? toast.success(data.message) : toast.error(data.message);
    } catch (e) {
      console.log(id, e);
      toast.error("Barcode tidak valid");
    }

    setTimeout(() => setActive(true), 3000);
  };

  useEffect(() => {
  const codeReader = new BrowserMultiFormatReader();

  codeReader.listVideoInputDevices()
    .then((devices) => {
      const deviceId = devices[0]?.deviceId;
      
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
    });

  return () => codeReader.reset();
}, [active]);

  return (
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
  );
}