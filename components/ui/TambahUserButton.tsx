'use client'
import { X } from "lucide-react";
import React, { useState } from "react";

export default function TambahUserButton() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const role = 'admin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users/CRUD', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: email,
                password: password,
                name: name,
                role: role,
            })
        });

        if(res.ok){
            setModalOpen(false);
            window.location.reload()
        }else{
            console.log("Data gagal disimpan");
            console.log({email, password, name, role})
        }
    }

    return (
        <>
            <button 
                onClick={() => setModalOpen(true)}
                className="bg-blue-400 hover:bg-purple-300 min-w-36 h-8 rounded-md transition-colors duration-200 text-white"
            >
                + Tambah Data
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg min-w-96">
                        <div className="flex justify-between items-center">
                            <span className="font-bold mb-4 flex items-center">Form Tambah User</span>
                            <X size={22} className="text-gray-600" onClick={() => setModalOpen(false)}/>
                        </div>
                        <form action="" className="space-y-4" onSubmit={handleSubmit}>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="name">Nama</label>
                                <input type="text" className="border rounded-md h-8 p-2" placeholder="HR PT.xxx" id="name" value={name} onChange={(e) => setName(e.target.value)}/>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="email">Email</label>
                                <input type="email" className="border rounded-md h-8 p-2" placeholder="Contoh: example@mail.com" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="password">Password</label>
                                <input type="text" className="border rounded-md h-8 p-2" placeholder="Masukkan password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>

                            <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                                Submit
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}