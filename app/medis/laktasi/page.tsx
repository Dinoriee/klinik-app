import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import KlinikScanner from "@/components/ui/ScannerPresensi";
import prisma from "@/lib/db";

const LaktasiMedisPage = async () => {
  const session = await getServerSession(AuthOptions);

  const pegawai = await prisma.pegawai.findMany({
    select: { id_pegawai: true, nama_pegawai: true, nik: true },
    orderBy: { nama_pegawai: "asc" },
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
      <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
        <div className="flex flex-col">
          <span className="text-gray-100 font-bold text-lg leading-none">Laktasi</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Medis"} />
        </div>
      </div>

      <div className="m-4 space-y-4">
        <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-bold text-gray-800 text-lg">Pengajuan Laktasi</h2>
          </div>
          <div className="mt-4">
            <KlinikScanner dataUser={pegawai} manualTitle="Input Manual" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaktasiMedisPage;
