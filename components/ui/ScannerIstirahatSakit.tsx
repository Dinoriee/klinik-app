"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";
import { pickPreferredCameraDeviceId } from "@/lib/camera";

export default function ScannerIstirahatSakit({ onScanSuccess }: { onScanSuccess: (data: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isActiveRef = useRef(true);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(true);

    const handleScan = useCallback((text: string) => {
        if (!isActiveRef.current) {
            return;
        }

        isActiveRef.current = false;
        setActive(false);
        onScanSuccess(text);

        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = setTimeout(() => {
            isActiveRef.current = true;
            setActive(true);
        }, 3000);
    }, [onScanSuccess]);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let isMounted = true;

        const startScanner = async () => {
            try {
                const devices = await codeReader.listVideoInputDevices();
                const preferredDeviceId = pickPreferredCameraDeviceId(devices);

                if (!preferredDeviceId || !videoRef.current) {
                    toast.error("Kamera tidak terdeteksi atau belum diizinkan");
                    return;
                }

                await codeReader.decodeFromVideoDevice(preferredDeviceId, videoRef.current, (result) => {
                    if (!isMounted || !result) {
                        return;
                    }

                    handleScan(result.getText());
                });
            } catch (error) {
                console.error(error);
                toast.error("Kamera tidak terdeteksi atau tidak ada izin akses");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void startScanner();

        return () => {
            isMounted = false;
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
            codeReader.reset();
        };
    }, [handleScan]);

    return (
        <div className="relative border-8 border-gray-800 rounded-2xl overflow-hidden bg-black w-full h-[140px] md:h-[180px] shadow-2xl flex items-center justify-center">
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20 text-white">
                    <PuffLoader color="#3B82F6" size={40} />
                    <p className="mt-4 font-mono text-xs animate-pulse tracking-widest">INITIALIZING...</p>
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
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 backdrop-blur-sm">
                    <p className="bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                        SUCCESS - PLEASE WAIT...
                    </p>
                </div>
            )}
        </div>
    );
}
