import Image from 'next/image'
import { LayoutDashboard, ClipboardClock, ReceiptText, Pill, MessageCircleQuestion, Frown, Baby, Milk, UserRoundPlus, ShieldPlus, Syringe} from 'lucide-react'
import Link from "next/link";
// import { usePathname } from "next/navigation";

export default function DashboardAdmin(){
    return(
        <div className='flex items-center justify-center h-full'>
            <h1 className='text-black'>Ini dashboard Admin</h1>
        </div>
    )
}