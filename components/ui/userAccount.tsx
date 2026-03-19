'use client'

import { useEffect, useRef, useState } from "react";
import { User, LogOut, ChevronRight, Bell } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const unreadCount = notifications?.filter((notification) => notification.status === "unread").length || 0;
  const hasUnread = unreadCount > 0;
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;

    const syncNotifications = async () => {
      try {
        const response = await fetch("/api/notifikasi", { method: "POST" });
        if (!response.ok) {
          return;
        }

        const result = await response.json();
        if (result.created > 0 || result.deleted > 0) {
          router.refresh();
        }
      } catch (error) {
        console.error("Gagal sinkronisasi notifikasi:", error);
      }
    };

    void syncNotifications();
  }, [router]);

  const markNotificationsAsRead = async () => {
    if (!hasUnread) {
      return;
    }

    try {
      await fetch("/api/notifikasi", { method: "PATCH" });
      router.refresh();
    } catch (error) {
      console.error("Gagal update notifikasi:", error);
    }
  };

  const handleToggleNotif = async () => {
    if (isNotificationOpen) {
      setNotificationOpen(false);
      await markNotificationsAsRead();
      return;
    }

    setNotificationOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-row items-center justify-center space-x-4 pr-4 pb-2">
      <div className="relative">
        <button
          type="button"
          onClick={handleToggleNotif}
          className="relative rounded-full p-1 transition-all duration-300 ease-in-out hover:bg-blue-800"
        >
          <Bell className="transition-all duration-300 ease-in-out" color="white" />
          {hasUnread && (
            <>
              <span className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full bg-red-500 opacity-40 animate-ping"></span>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </button>

        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={handleToggleNotif}></div>

            <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl animate-in fade-in zoom-in duration-200">
              <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase text-blue-600">Notifikasi Obat</p>
                  <span className="text-[10px] font-semibold text-gray-500">{notifications.length} item</span>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item, index) => (
                    <div
                      className="border-b border-gray-50 px-4 py-3 transition-colors last:border-0 hover:bg-gray-50"
                      key={`${item.id_obat}-${index}`}
                    >
                      {item.status === "unread" ? (
                        <p className="text-sm text-red-400">New</p>
                      ) : null}
                      <p className="font-mono text-[10px] text-gray-400">{item.obat.nama_obat}</p>
                      <p className="text-sm font-semibold leading-tight text-gray-900">{item.pesan}</p>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-4 text-center text-xs italic text-gray-400">Tidak ada notifikasi</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <div className="flex flex-row items-center justify-center">
          <div
            className="flex cursor-pointer items-center space-x-2 rounded-lg p-1 transition duration-200 hover:bg-blue-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            <User size={24} className="rounded-full bg-white p-0.5 text-gray-800" />
            <span className="text-sm font-medium text-white">{userName}</span>
          </div>
          <ChevronRight
            className={`transition-all duration-300 ease-in-out ${isOpen ? "rotate-90" : "rotate-0"}`}
            color="white"
            onClick={() => setIsOpen(true)}
          />
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>

            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl animate-in fade-in zoom-in duration-200">
              <div className="mb-1 border-b border-gray-50 px-4 py-2">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="truncate text-sm font-bold text-gray-900">{userName}</p>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center rounded-md px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
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
