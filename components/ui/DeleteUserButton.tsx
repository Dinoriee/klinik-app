"use client"

import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteUserButton({userId} : {userId: number}){
    const router = useRouter();
    const [isDelete, setIsDelete] = useState(false);


    async function handleDelete() {
        const confirm = window.confirm("Apakah anda ingin menghapus user ini?");
        if(!confirm) return;

        setIsDelete(true);

        try{
            const res = await fetch("/api/users/CRUD", {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id_user: userId}),
            });

            if (res.ok){
                router.refresh();
            } else{
                alert("Gagal menghapus user");
            }
        }catch(error){
            console.error(error);
        }finally{
            setIsDelete(false);
        }
    }

    return(
        <button className="text-red-300 hover:text-red-600 px-3 py-1 rounded-md transition duration-200" onClick={handleDelete}>
                    <Trash size={20}/>
        </button>
    )
}