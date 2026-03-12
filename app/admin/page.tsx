import { Pill, Smile, User } from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import UserAccount from "@/components/ui/userAccount";
import PengunjungMonth from "@/components/pengunjungMonth";
import PengunjungDaily from "@/components/pengunjungDaily";
import ShowMedicineDetail from "@/components/ui/showMedicineDetail";

interface PengunjungBulanan {
  bulan: string;
  total: number;
}

interface Pengunjung1Bulan {
  tanggal: string;
  total: number;
}

interface PengunjungMingguan {
  hari: string;
  total: number;
}

interface PengunjungHarian {
  jam: string;
  total: number;
}

export interface ChartData {
  month: PengunjungBulanan[];
  monthly: Pengunjung1Bulan[];
  weekly: PengunjungMingguan[];
}

const DashboardAdmin = async () => {
  const session = await getServerSession(AuthOptions);
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startOfMonth = new Date(year, month, 1);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [medisCount, obatCount, pengunjung, pengunjungCount] = await Promise.all([
    prisma.tenaga_Medis.count(),
    prisma.obat.count(),
    prisma.presensi.findMany({
      orderBy: { jam_masuk: "desc" },
    }),
    prisma.presensi.count({
      where: {
        jam_masuk: { gte: startOfToday, lte: endOfToday }
      }
    })
  ]);

  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const weeklyTemplate = days.reduce<Record<string, PengunjungMingguan>>((acc, day) => {
    acc[day] = { hari: day, total: 0 };
    return acc;
  }, {});

  const weeklyDataResult = pengunjung
    .filter(p => new Date(p.jam_masuk) >= startOfWeek)
    .reduce((acc, item) => {
      const hari = new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(new Date(item.jam_masuk));
      if (acc[hari]) acc[hari].total += 1;
      return acc;
    }, { ...weeklyTemplate });

  const groupedWeeklyData = Object.values(weeklyDataResult);

  const oneMonthTemplate: Record<string, Pengunjung1Bulan> = {};
  for (let i = 1; i <= lastDay; i++) {
    const label = i.toString();
    oneMonthTemplate[label] = { tanggal: label, total: 0 };
  }

  const monthlyDataResult = pengunjung
    .filter(p => new Date(p.jam_masuk) >= startOfMonth)
    .reduce((acc, item) => {
      const tanggalData = new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(new Date(item.jam_masuk));
      if (acc[tanggalData]) acc[tanggalData].total += 1;
      return acc;
    }, { ...oneMonthTemplate });

  const groupedMonthlyData = Object.values(monthlyDataResult);

  const monthDataResult = pengunjung.reduce<Record<string, PengunjungBulanan>>((acc, item) => {
    const namaBulan = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date(item.jam_masuk));
    if (!acc[namaBulan]) {
      acc[namaBulan] = { bulan: namaBulan, total: 0 };
    }
    acc[namaBulan].total += 1;
    return acc;
  }, {});

  const groupedMonthData = Object.values(monthDataResult);
  groupedMonthData.splice(4,2);

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

  const notifications = await prisma.notifikasi.findMany({
    select:{
      id_obat: true,
      obat:{
        select:{
          nama_obat: true,
        }
      },
      pesan: true,
      status: true,
    },
    orderBy:[
      {status: 'desc'},
      {id_notifikasi: 'asc'},
    ]
  });

  const groupedData: ChartData = {
    month: groupedMonthData,
    monthly: groupedMonthlyData,
    weekly: groupedWeeklyData,
  };

  return (
    <div>
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-gray-800">
            Klinik<span className="text-gray-100"> / Presensi</span>
          </h1>
          <span className="text-gray-100 font-bold">Dashboard Admin</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Guest"} />
        </div>
      </div>

      <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md m-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <User size={36} className="bg-green-500 text-white p-2 rounded-md" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Jumlah User</span>
              <span className="text-2xl font-bold text-green-600">{medisCount}</span>
            </div>
          </div>
          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm justify-between">
            <div className="flex flex-row items-center space-x-3">  
              <Pill size={36} className="bg-blue-500 text-white p-2 rounded-md" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Jumlah Obat</span>
                <span className="text-2xl font-bold text-blue-600">{obatCount}</span>
              </div>
            </div>
            <ShowMedicineDetail/>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
            <Smile size={36} className="bg-red-500 text-white p-2 rounded-md" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Kunjungan Hari Ini</span>
              <span className="text-2xl font-bold text-red-600">{pengunjungCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between pt-10 gap-10">
          <PengunjungMonth chartData={groupedData} />
          <PengunjungDaily chartData={groupedDailyData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;