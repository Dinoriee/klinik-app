"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

interface ScannerProps {
  onScanSuccess: (text: string) => void;
}

export default function Scanner({ onScanSuccess }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);

  const handleScan = (text: string) => {
    if (!active) return;
    setActive(false);
    onScanSuccess(text);
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
    // UPDATE: Menghapus aspect-square dan memanjangkan tinggi (h-[350px]) agar jadi persegi panjang lebar
    <div className="relative border-8 border-gray-800 rounded-2xl overflow-hidden bg-black w-full h-[350px] shadow-2xl">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20 text-white">
          <PuffLoader color="#3B82F6" size={50} />
          <p className="mt-4 font-mono text-sm animate-pulse">INITIALIZING CAMERA...</p>
        </div>
      )}
      
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
      />

      {active && !loading && (
        <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_red] opacity-70 animate-bounce z-10" />
      )}

      {!active && !loading && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
          <p className="bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold">
            SCAN SUCCESS!
          </p>
        </div>
      )}
    </div>
  );
}