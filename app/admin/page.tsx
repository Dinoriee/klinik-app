import { Pill, Search, Smile, User } from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import TambahUserButton from "@/components/ui/TambahUserButton";
import EditUserButton from "@/components/ui/EditUserButton";
import DeleteUserButton from "@/components/ui/DeleteUserButton";
import UserAccount from "@/components/ui/userAccount";
import PengunjungMonth from "@/components/pengunjungMonth";
import PengunjungDaily from "@/components/pengunjungDaily";

interface PengunjungBulanan{
  bulan: string;
  total: number;
}

interface PengunjungHarian{
  jam: string;
  total: number;
}

const now = new Date();
const startOfToday = new Date(now.setHours(0, 0, 0, 0));
const endOfToday = new Date(now.setHours(23, 59, 59, 59));

const DashboardAdmin = async () => {
  const session = await getServerSession(AuthOptions);
  console.log(session);

  const [users, medisCount] = await Promise.all([prisma.tenaga_Medis.findMany({
    orderBy: {
      id_user: "desc",
    },
  }),
  prisma.tenaga_Medis.count()
]);

const [obat, obatCount] = await Promise.all([prisma.obat.findMany({
    orderBy: {
      id_obat: "desc",
    },
  }),
  prisma.obat.count()
]); 

const [pengunjung, pengunjungCount] = await Promise.all([prisma.presensi.findMany({
    orderBy: {
      id_presensi: "desc",
    },
  }),
  prisma.presensi.count({
    where:{
      jam_masuk:{
        gte: startOfToday,
        lte: endOfToday,
      }
    }
  })
]);

const monthData = pengunjung.reduce((acc: Record<string, PengunjungBulanan>, item) => {
  const namaBulan = new Intl.DateTimeFormat("id-ID", {month: "long"}).format(item.jam_masuk);

  if(!acc[namaBulan]) {
    acc[namaBulan] = { bulan: namaBulan, total: 0};
  }

  acc[namaBulan].total += 1;
  return acc
}, {});

const groupedMonthData = Object.values(monthData);

const hoursTemplate: Record<string, PengunjungHarian> = {};
for (let i = 0; i < 24; i++) {
  const label = i.toString().padStart(2, '0');
  hoursTemplate[label] = { jam: `${label}:00`, total: 0 };
}

const dataHariIni = pengunjung.filter(p => new Date(p.jam_masuk) >= startOfToday);

const dailyData = dataHariIni.reduce((acc, item) => {
  const jam = new Intl.DateTimeFormat("id-ID", { hour: "2-digit" }).format(new Date(item.jam_masuk));
  if (acc[jam]) {
    acc[jam].total += 1;
  }
  
  return acc;
}, { ...hoursTemplate });
const groupedDailyData = Object.values(dailyData).sort((a, b) => a.jam.localeCompare(b.jam));


  return (
    <div>
      <div className="flex justify-between p-4">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik<span className="text-black"> / Presensi</span>
          </h1>
          <span className="text-black font-bold">Presensi</span>
        </div>
        {}
        <div className="flex space-x-1">
          <UserAccount userName={session?.user?.name}/>
        </div>
      </div>
      <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
        <div className="flex justify-between">
          <div className="flex items-center  space-x-3">
            <User size={36} className="bg-green-500 text-white p-1 rounded-md shadow-md"/>
            <div className="flex flex-col">
                <span className="text-xl font-bold">Jumlah user</span>
                <span className="font-black text-green-600">{medisCount}</span>
            </div>
          </div>
          <div className="flex items-center  space-x-3">
            <Pill size={36} className="bg-blue-500 text-white p-1 rounded-md shadow-md"/>
            <div className="flex flex-col">
                <span className="text-xl font-bold">Jumlah Obat</span>
                <span className="font-black text-blue-600">{obatCount}</span>
            </div>
          </div>
          <div className="flex items-center  space-x-3">
            <Smile size={36} className="bg-red-500 text-white p-1 rounded-md shadow-md"/>
            <div className="flex flex-col">
                <span className="text-xl font-bold">Kunjungan Hari Ini</span>
                <span className="font-black text-red-600">{pengunjungCount}</span>
            </div>
          </div>
          <div className="flex space-x-2 p-2">
          </div>
        </div>
        <div className="flex justify-between pt-10 space-x-10">
          <PengunjungMonth chartData={groupedMonthData}/>
          <PengunjungDaily chartData={groupedDailyData}/>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
