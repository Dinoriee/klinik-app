import Image from 'next/image'
import { LayoutDashboard, ClipboardClock, ReceiptText, Pill, MessageCircleQuestion, Frown, Baby, Milk, Syringe   } from 'lucide-react'
import Link from "next/link"

export default function SidebarTenagaMedis(){
    return(
        <aside className='p-4 w-1/7 max-h-screen'>
                <div>    
                    <Image src="/logo-klinik.png" alt='Logo Klinik' width={500} height={500} className="w-24 h-auto"/>
                    <Link className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out' href="/medis">
                        <LayoutDashboard size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Dashboard</span>
                    </Link>
                </div>
                <div className='space-y-2'>
                    <h1 className='text-gray-400 text-base font-medium pt-4 pl-2'>Menu</h1>
                    <Link href="/medis/presensi" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <ClipboardClock size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Presensi</span>
                    </Link>
                    <Link href="#" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <ReceiptText size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Kwitansi</span>
                    </Link>
                    {/* Link Minta Obat dihidupkan */}
                    <Link href="/medis/minta-obat" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <Pill size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Minta Obat</span>
                    </Link>
                    <Link href="#" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <MessageCircleQuestion size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Konsultasi Dokter</span>
                    </Link>
                    <Link href="/medis/penyakit" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <Syringe size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Kelola Penyakit</span>
                    </Link>
                    <Link href="#" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <Frown size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Istirahat Sakit</span>
                    </Link>
                    <Link href="#" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <Baby size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Istirahat Hamil</span>
                    </Link>
                    <Link href="#" className='text-gray-400 flex space-x-2 items-center rounded-md shadow-none hover:bg-gray-50 border-0 hover:border-2 hover:border-blue-300 hover:shadow-md hover:scale-105 p-2 transition-all duration-200 ease-in-out'>
                        <Milk size={20} className='bg-gray-200 p-1 rounded-md shadow-md'/>
                        <span className='text-sm'>Laktasi</span>
                    </Link>
                </div>
            </aside>
    )
}
