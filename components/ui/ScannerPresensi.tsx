"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

interface TenagaMedis{
    id_tenaga_medis: string;
    nama_tenaga_medis: string;
    nik: string;
}

export default function KlinikScanner({tenagaMedis} : {tenagaMedis: TenagaMedis[]}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  const handleScan = async (text: string) => {
    if (!active) return;
    setActive(false);
    const barcodeData = JSON.parse(text);

    const nik = barcodeData.nik;
    console.log("Data barcode: ", text);


    try {
      setSelectedId(nik);
      const res = await fetch('/api/tenaga-medis/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: nik, keterangan: "hadir" })
      });

      const data = await res.json();
      res.ok ? toast.success(data.message) : toast.error(data.message);
    } catch (e) {
      console.log(nik, e);
      toast.error("Barcode tidak valid");
    }

    setTimeout(() => setActive(true), 1500);
  };

  const handleSubmit = async(e: React.FormEvent) => {
      e.preventDefault();
    
      if(!selectedId) return toast.error("Masukkan data yang valid!");
      console.log(selectedId);
        const selectedPerson = tenagaMedis.find(t => t.nik === selectedId);
        const nama = selectedPerson ? selectedPerson.nama_tenaga_medis : "Unknown";

        const res = await fetch('/api/tenaga-medis/presensi', {
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
        items={tenagaMedis}
        value={selectedId}
        onValueChange={(val) => {
                                      const found = tenagaMedis.find(t => t.nik === val);
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
                      {item.nama_tenaga_medis}
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