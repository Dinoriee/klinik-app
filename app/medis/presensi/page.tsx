import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import PresensiButton from "@/components/ui/PresensiMedisButton";
import KlinikScanner from "@/components/ui/ScannerPresensi";
import NikInput from "@/components/ui/nik";
import prisma from "@/lib/db";
import UserAccount from "@/components/ui/userAccount";


interface Medis{
  nama_tenaga_medis: string,
  nik: string,
}

const PresensiTenagaMedis = async () => {
  const session = await getServerSession(AuthOptions);
  console.log(session);

  let tenagaMedis: { id_tenaga_medis: string; nama_tenaga_medis: string; nik: string }[] = [];
  try {
    tenagaMedis = await prisma.$queryRaw`
      SELECT
        CAST(id_tenaga_medis AS TEXT) AS id_tenaga_medis,
        nama_tenaga_medis,
        CAST(nik AS TEXT) AS nik
      FROM "Tenaga_Medis"
      ORDER BY nama_tenaga_medis ASC
    `;
  } catch {
    tenagaMedis = await prisma.$queryRaw`
      SELECT
        CAST(id_tenaga_medis AS TEXT) AS id_tenaga_medis,
        nama_tenaga_medis,
        CAST(kode_tenaga_medis AS TEXT) AS nik
      FROM "Tenaga_Medis"
      ORDER BY nama_tenaga_medis ASC
    `;
  }

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
          <span className="text-gray-100 font-bold text-lg leading-none">Presensi</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Medis"} />
        </div>
      </div>
      <div className="bg-gray-50 text-gray-600 m-4 p-4 rounded-md shadow-md">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">Scanner Presensi</h2>
          <div className="flex space-x-2 p-2">
            {/* <PresensiButton tenagaMedis={tenagaMedis} /> */}
          </div>
        </div>
        <div className="mt-2">
          {/* revisi scan nik */}
          <KlinikScanner dataUser={tenagaMedis} />
        </div>
      </div>
    </div>
  );
};

export default PresensiTenagaMedis;
