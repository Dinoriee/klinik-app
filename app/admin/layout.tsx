import Sidebar from "@/components/sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full">{children}</main>
      <Toaster richColors position="bottom-right" style={{ zIndex: 9999 }} />
    </div>
  );
}