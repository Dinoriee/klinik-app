import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import ScannerLaktasi from "@/components/ui/ScannerLaktasi";
import InputNikLaktasi from "@/components/ui/InputNikLaktasi";
import KlinikScanner from "@/components/ui/ScannerPresensi";
import prisma from "@/lib/db";

const LaktasiMedisPage = async () => {
  const session = await getServerSession(AuthOptions);
  const pegawai = await prisma.pegawai.findMany({
    select:{
      id_pegawai: true,
      nama_pegawai: true,
      nik: true,
    }
  });

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

  return (
    <div>
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik<span className="text-white"> / Laktasi</span>
          </h1>
          <span className="text-white font-bold">Laktasi</span>
        </div>
        <UserAccount notifications={notifications} userName={session?.user?.name || "Guest"} />
      </div>

      <div className="mx-4 mb-4 space-y-4">
        <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-bold text-white">Pengajuan Laktasi</h2>
          </div>
          <div className="mt-4">
            <KlinikScanner dataUser={pegawai} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaktasiMedisPage;
