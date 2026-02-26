'use client'
import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

export default function UserAccount({ userName }: { userName: string | null | undefined }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 p-1 rounded-lg transition duration-200 "
        onClick={() => setIsOpen(!isOpen)}
      >
        <User size={24} className="bg-gray-400 rounded-full text-gray-800 p-0.5" />
        <span className="text-gray-800 font-medium text-sm">{userName}</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
            </div>
            
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition">
              <Settings size={16} className="mr-2" /> Profile
            </button>
            
            <hr className="my-1 border-gray-50" />
            
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition font-semibold"
            >
              <LogOut size={16} className="mr-2" /> Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}