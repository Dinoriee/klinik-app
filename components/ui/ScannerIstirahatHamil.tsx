"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

export default function ScannerIstirahatHamil() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);

  const handleScan = useCallback(async (text: string) => {
    if (!active) return;

    setActive(false);
    try {
      let id: string | undefined;
      let nik: string | undefined;

      try {
        const barcodeData = JSON.parse(text);
        id = barcodeData?.id ? String(barcodeData.id) : undefined;
        nik = barcodeData?.nik ? String(barcodeData.nik) : undefined;
      } catch {
        nik = String(text).trim();
      }

      if (!id && !nik) {
        toast.error("QR tidak berisi ID atau NIK.");
        setTimeout(() => setActive(true), 3000);
        return;
      }

      const res = await fetch("/api/tenaga-medis/istirahat-hamil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tenaga_medis: id,
          nik,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Barcode tidak valid");
    }

    setTimeout(() => setActive(true), 3000);
  }, [active]);

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

    codeReader
      .listVideoInputDevices()
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
    <div className="relative border-8 border-gray-800 rounded-2xl overflow-hidden bg-black max-h-96 shadow-2xl">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20 text-white">
          <PuffLoader color="#EC4899" size={50} />
          <p className="mt-4 font-mono text-sm animate-pulse">INITIALIZING...</p>
        </div>
      )}

      <video ref={videoRef} className="w-full h-auto object-cover" />

      {active && !loading && (
        <div className="absolute top-1/2 left-0 w-full h-1 bg-pink-500 shadow-[0_0_15px_#ec4899] opacity-70 animate-bounce z-10" />
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
