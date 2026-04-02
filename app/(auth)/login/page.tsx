"use client";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserData } from "@/app/page";
import { Eye, EyeClosed, Mail, Key } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <div className="w-screen h-screen flex flex-row items-center justify-evenly">
      <div className="w-1/2 flex justify-center items-center relative">
        <Image src="/login-page.jpg" alt='Logo Klinik' width={1080} height={1080} className="w-screen h-screen object-cover rounded-tr-2xl rounded-br-2xl bg-linear-to-t from-blue-600 to-transparent"/>
        <div className="absolute bg-linear-to-t from-blue-400 from-20% to-60% to-transparent w-full h-full text-white flex flex-col items-start justify-end pb-16 pl-8">
          <Image src="/logo-klinik.png" alt='Logo Klinik' width={500} height={500} className="w-48 grayscale brightness-0 invert"/>
          <p className="text-sm">Berkomitmen dalam Menjaga Kualitas Hidup Anda Melalui Layanan Medis Terpadu yang Berfokus pada Pencegahan serta Pemulihan Secara Optimal.</p>
        </div>
      </div>
      <div className="w-full h-full rounded-tl-2xl rounded-bl-2xl flex flex-row justify-center items-center relative">
        <form
          action=""
          className="flex flex-col w-full h-full justify-center items-center p-8"
          onSubmit={handleSubmit}
        >
          {errorMessage && (
              <div className="mt-4 p-3 bg-red-300 border border-red-500 text-red-700 rounded-sm text-sm font-medium">
                {errorMessage}
              </div>
            )}
          <div className="flex flex-col w-full justify-center items-center text-black space-y-8">
            <div className="absolute inset-0 top-0 left-0 h-screen z-0">
              <Image src="/bg.jpg" alt='Logo Klinik' fill className="object-cover opacity-70" />
              <div className="absolute inset-0 bg-radial-[at_80%_95%] from-transparent to-white to-75%" />
            </div>
            <div className="w-full space-y-8 pl-24 z-10">
              <div>
                <Image src="/logo-klinik.png" alt='Logo Klinik' width={500} height={500} className="w-48 mr-16"/>
                <h1 className="text-black text-2xl font-bold">Login Page</h1>
                <span className="text-gray-300">Login to your account</span>
              </div>
              <div className="flex flex-col space-y-2 w-full pt-4">
                {/* <label htmlFor="email" className="text-black">
                  Email
                </label> */}
                <input
                  type="email"
                  className=" outline-none w-1/2 h-10 p-4 border-b-2 border-black focus:border-blue-500 transition-colors duration-300 ease-in-out"
                  id="email"
                  placeholder="Masukkan email anda..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2 w-full pb-4">
                {/* <label htmlFor="password" className="text-black">Password</label> */}
                <div className="relative flex w-1/2 items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    className=" outline-none w-full h-10 p-4 border-b-2 border-black focus:border-blue-500 transition-colors duration-300 ease-in-out"
                    id="password"
                    placeholder="Masukkan password anda..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                  </button>
                </div>
              </div>
              <button
                className="bg-blue-500 w-1/2 h-8 rounded-2xl text-white hover:scale-110 transition-all duration-200 hover:bg-blue-600 pt4"
                type="submit"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
