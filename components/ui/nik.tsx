'use client'

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { useState } from "react";
import { toast } from "sonner";


interface tenagaMedis{
    nama_tenaga_medis: string;
    id_tenaga_medis: string;
    nik: string;
}

export default function NikInput({tenagaMedis}: {tenagaMedis: tenagaMedis[]}){
    const [selectedId, setSelectedId] = useState("");

    const handleSubmit = async(e: React.FormEvent) => {
      if(!selectedId) return toast.error("Masukkan data yang valid!");
      console.log(selectedId);
        const selectedPerson = tenagaMedis.find(t => t.id_tenaga_medis === selectedId);
        const nama = selectedPerson ? selectedPerson.nama_tenaga_medis : "Unknown";

        const res = await fetch('/api/tenaga-medis/presensi', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                nama: nama,
                id_tenaga_medis: selectedId,
            })
        });

        const data = await res.json();

        if(res.ok){
            toast.success(data.message);
            setTimeout(() => window.location.reload(), 1000);
        }else{
            console.log("Gagal Absen");
            console.log({selectedId});
            toast.error(data.message);
        }
    }
    
    return(
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <span className="text-2xl font-bold">Presensi Manual</span>
          <div className="flex space-x-4">
            <Combobox
      items={tenagaMedis}
      onValueChange={(val) => {
                                    const found = tenagaMedis.find(t => t.nik === val);
                                    if (found) setSelectedId(found.id_tenaga_medis)}} 
    //   itemToStringValue={}
    >
      <ComboboxInput placeholder="Cari NIK anda..." />
      <ComboboxContent>
        <ComboboxEmpty>NIK tidak ditemukan</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id_tenaga_medis} value={item.nik}>
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
            <button className="bg-blue-400 text-white rounded-md w-32" type="submit">Presensi</button>
          </div>
        </form>
    )
}