import { 
  LayoutDashboard, 
  ClipboardClock, 
  ReceiptText, 
  Pill, 
  MessageCircleQuestion, 
  Frown, 
  Baby, 
  Milk, 
  UserRoundPlus, 
  ShieldPlus, 
  Syringe,
  LucideIcon 
} from 'lucide-react'

export interface SidebarItem {
  name: string
  href: string
  icon: LucideIcon
}

export const menuUtama: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Presensi', href: '/admin/presensi', icon: ClipboardClock },
  { name: 'Kwitansi', href: '#', icon: ReceiptText },
  { name: 'Minta Obat', href: '/admin/minta-obat', icon: Pill },
  { name: 'Konsultasi Dokter', href: '/admin/konsultasi-dokter', icon: MessageCircleQuestion },
  { name: 'Istirahat Sakit', href: '/admin/istirahat-sakit', icon: Frown },
  { name: 'Istirahat Hamil', href: '#', icon: Baby },
  { name: 'Laktasi', href: '#', icon: Milk },
]

export const menuKelola: SidebarItem[] = [
  { name: 'Kelola Tenaga Medis', href: '/admin/tenaga-medis', icon: UserRoundPlus },
  { name: 'Kelola Pegawai', href: '/admin/pegawai', icon: UserRoundPlus },
  { name: 'Kelola Obat', href: '/admin/kelola-obat', icon: ShieldPlus },
  { name: 'Kelola Penyakit', href: '/admin/penyakit', icon: Syringe },
  { name: 'Kelola User', href: '/admin/user', icon: UserRoundPlus },
]

export const menuMedis: SidebarItem[] = [
  { name: 'Dashboard', href: '/medis', icon: LayoutDashboard },
  { name: 'Presensi', href: '/medis/presensi', icon: ClipboardClock },
  { name: 'Kwitansi', href: '#', icon: ReceiptText },
  { name: 'Minta Obat', href: '/medis/minta-obat', icon: Pill },
  { name: 'Konsultasi Dokter', href: '/medis/konsultasi-dokter', icon: MessageCircleQuestion },
  { name: 'Istirahat Sakit', href: '/medis/istirahat-sakit', icon: Frown },
  { name: 'Istirahat Hamil', href: '#', icon: Baby },
  { name: 'Laktasi', href: '#', icon: Milk },
]

export const menuKelolaMedis: SidebarItem[] = [
  { name: 'Kelola Obat', href: '/medis/kelola-obat', icon: ShieldPlus },
  { name: 'Kelola Penyakit', href: '/medis/penyakit', icon: Syringe },
]