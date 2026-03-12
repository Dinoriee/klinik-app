'use client'
import Image from 'next/image'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { menuUtama, menuKelola, SidebarItem } from '@/lib/listMenu'


export default function Sidebar(){
    const pathname = usePathname();

    const NavLink = ({ item }: { item: SidebarItem }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    const baseStyle = "flex space-x-2 items-center rounded-md p-2 transition-all duration-200 ease-in-out scale-95 hover:scale-100"
    const activeStyle = isActive 
      ? "bg-blue-700 border-2 border-blue-300 shadow-md scale-100" 
      : "text-blue-400 hover:bg-blue-800 hover:text-white "

    return (
      <Link 
        href={item.href} 
        className={`${baseStyle} ${activeStyle}`}
      >
        <Icon 
          size={20} 
          className={`p-1 rounded-md shadow-md ${isActive ? "bg-white text-blue-900" : "bg-gray-200 text-blue-900"}`}
        />
        <span className={`text-sm ${isActive ? "text-white" : "text-gray-100"}`}>
          {item.name}
        </span>
      </Link>
    )
  }

    return(
        <aside className='p-4 w-1/6 min-h-screen bg-blue-900 shadow-xl sticky top-0'>
                <div className='space-y-1.5'>    
                    <Image src="/logo-klinik.png" alt='Logo Klinik' width={500} height={500} className="w-24 h-auto"/>
                    <h1 className='text-gray-300 text-base font-medium pt-4 pl-2'>Menu</h1>
                    {menuUtama.map((item) => (
                        <NavLink key={item.name} item={item}/>
                    ))}
                </div>
                <div className='space-y-1.5'>
                    <h1 className='text-gray-300 text-base font-medium pt-4 pl-2'>Kelola</h1>
                    {menuKelola.map((item) => (
                        <NavLink key={item.name} item={item}/>
                    ))}
                </div>
            </aside>
    )
}
