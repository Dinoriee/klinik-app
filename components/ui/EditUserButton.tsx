"use client";
import { SquarePen, X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface TenagaMedis {
  nama_tenaga_medis: string;
}

interface User {
  id_user: number;
  email: string;
  name: string;
  tenagaMedis?: TenagaMedis | null;
}

export default function EditUserButton({ user }: { user: User }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(
    user.tenagaMedis?.nama_tenaga_medis || user.name || "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/users/CRUD`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        name: name,
        id_user: user.id_user,
      }),
    });

    if (res.ok) {
      setModalOpen(false);
      window.location.reload();
    } else {
      console.log("Data gagal disimpan");
      console.log({ email, name });
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setEmail(user.email);
      setName(user.tenagaMedis?.nama_tenaga_medis || user.name || "");
    }
  }, [isModalOpen, user]);

  const handleCloseModal = () => {
    setEmail("");
    setName("");
    setModalOpen(false);
  };

  return (
    <>
      <button
        className="text-yellow-300 hover:text-yellow-600 px-3 py-1 rounded-md transition duration-200"
        onClick={() => setModalOpen(true)}
      >
        <SquarePen size={20} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg min-w-96">
            <div className="flex justify-between items-center">
              <span className="font-bold mb-4 flex items-center">
                Form Edit User
              </span>
              <X
                size={22}
                className="text-gray-600"
                onClick={handleCloseModal}
              />
            </div>
            <form
              action=""
              className="flex flex-col space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col space-y-2">
                <label htmlFor="name">Nama</label>
                <input
                  type="text"
                  className="border rounded-md h-8 p-2"
                  placeholder="HR PT.xxx"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="border rounded-md h-8 p-2"
                  placeholder="Contoh: example@mail.com"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
