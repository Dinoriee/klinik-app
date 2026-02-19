"use client";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserData } from "@/app/page";
import { Eye, EyeClosed, Mail, Key } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginProps {
  setUser: Dispatch<SetStateAction<UserData | null>>;
}

export default function LoginPage({ setUser }: LoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault();
    setErrorMessage("");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Format email anda salah.");
      return;
    }
    
    const signInData = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    });
    if(signInData?.error){
      console.log(signInData.error);
      setErrorMessage("Email atau Password yang anda masukkan salah.");
    }else{
      const session = await getSession();
      const role = session?.user?.role;
      if(role === 'admin'){
        router.push('/admin');
      }else if(role === 'perawat' || role === 'dokter'){
        router.push('/medis');
      }
    }
  }

  return (
    <div className="w-screen h-screen bg-gray-200">
      <div className="w-full h-full flex justify-center items-center">
        <form
          action=""
          className="bg-white rounded-md flex flex-col w-1/3 h-2/3 justify-evenly items-start p-8 border-2 border-black"
          onSubmit={handleSubmit}
        >
          <div>
            <h1 className="text-xl font-bold text-black">Login Page</h1>
            <span className="text-sm text-black">Sistem Klinik Terpadu</span>
          </div>
          {errorMessage && (
              <div className="mt-4 p-3 bg-red-300 border border-red-500 text-red-700 rounded-sm text-sm font-medium">
                {errorMessage}
              </div>
            )}
          <div className="flex flex-col w-full justify-center text-black space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="email" className="">
                Email
              </label>
              <input
                type="text"
                className="bg-gray-50 outline-none rounded-sm w-full h-10 p-4 border-2 border-black focus:border-blue-500 transition-colors duration-300 ease-in-out"
                id="email"
                placeholder="Masukkan email anda..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "password" : "text"}
                  className="bg-gray-50 outline-none rounded-sm w-full h-10 p-4 border-2 border-black focus:border-blue-500 transition-colors duration-300 ease-in-out"
                  id="email"
                  placeholder="Masukkan password anda..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4"
                >
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              className="bg-blue-500 w-32 h-8 rounded-md text-white"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
