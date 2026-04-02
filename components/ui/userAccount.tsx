'use client'
import { useState } from "react";
import { User, LogOut, Settings, ArrowBigLeftIcon, ChevronRight, Bell } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

interface Notif {
  id_obat: string;
  obat: {
    nama_obat: string;
  };
  pesan: string;
  status: string;
}

export default function UserAccount({ userName, notifications }: { userName: string | null | undefined; notifications: Notif[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const hasUnread = notifications?.some(n => n.status === 'unread') || false;
  const unreadCount = notifications?.filter(n => n.status === 'unread').length || 0;

  const handleToggleNotif = async () => {
    const isCurrentlyOpen = isNotificationOpen;
    
    if (isCurrentlyOpen) {
      setNotificationOpen(false);
      
      if (hasUnread) {
        try {
          await fetch('/api/notifikasi', { method: 'PATCH' });
          router.refresh();
        } catch (e) {
          console.error("Gagal update");
        }
      }
    } else {
      setNotificationOpen(true);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center pr-4 pb-2 space-x-4">
      <div className="">
        <div className="flex flex-row justify-center items-center relative">
            <Bell className={`transition-all duration-300 ease-in-out`} color="white" onClick={() => setNotificationOpen(true)}/>
              {hasUnread && (
        <div className="absolute top-0 right-0" onClick={() => setNotificationOpen(true)}>
          <span className=" top-0 right-0 bg-red-500 animate-ping opacity-75"></span>
          <span className=" top-0 right-0 bg-red-500 w-16 h-16 rounded-full text-xs border border-blue-600 text-white">{unreadCount}</span>
        </div>
      )}
        </div>
        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)}></div>
            
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-20 overflow-hidden animate-in fade-in zoom-in duration-200" onMouseLeave={handleToggleNotif}>
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Notifikasi Obat</p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors" key={item.id_obat}>
                      {item.status === 'unread' ? (
                        <p className="text-red-400 text-sm">New</p>
                      ) : (<p></p>)}
                      <p className="text-[10px] text-gray-400 font-mono">{item.obat.nama_obat}</p>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{item.pesan}</p>
                    </div>  
                  ))
                ) : (
                  <p className="px-4 py-4 text-xs text-gray-400 text-center italic">Tidak Ada Notifikai</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="relative">
        <div className="flex flex-row justify-center items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-blue-800 p-1 rounded-lg transition duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <User size={24} className="bg-white rounded-full text-gray-800 p-0.5" />
            <span className="text-white font-medium text-sm">{userName}</span>
          </div>
            <ChevronRight className={`transition-all duration-300 ease-in-out ${isOpen ? 'rotate-90' : 'rotate-0'}`} color="white" onClick={() => setIsOpen(true)}/>
        </div>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
              </div>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition font-semibold rounded-md"
              >
                <LogOut size={16} className="mr-2" /> Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}