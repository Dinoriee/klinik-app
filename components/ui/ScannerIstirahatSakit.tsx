"use client";

import Scanner from "@/components/ui/Scanner";

export default function ScannerIstirahatSakit({ onScanSuccess }: { onScanSuccess: (data: string) => void }) {
  return <Scanner onScanSuccess={onScanSuccess} />;
}
