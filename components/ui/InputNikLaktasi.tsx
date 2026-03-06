"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

export default function InputNikLaktasi() {
  const [nik, setNik] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nik.trim()) {
      toast.error("NIK wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/tenaga-medis/laktasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik: nik.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setNik("");
      } else {
        toast.error(data.message || "Gagal memproses laktasi.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          className="border border-blue-300 rounded-xl h-11 pl-12 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-w-[340px]"
          placeholder="Cari NIK..."
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-8 h-11 rounded-xl text-sm"
      >
        {isLoading ? "Proses..." : "Ajukan"}
      </button>
    </form>
  );
}
