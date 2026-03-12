import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { toast } from "sonner";

// 1. IMPORT AUTH PROVIDER YANG BARU DIBUAT
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aplikasi Klinik', // Silakan sesuaikan dengan nama aplikasi Anda
  description: 'Sistem Informasi Manajemen Klinik',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        {/* 2. BUNGKUS CHILDREN DENGAN AUTH PROVIDER */}
        <AuthProvider>
          {children}
          
        </AuthProvider>

      </body>
    </html>
  )
}