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
      <div className="flex justify-between pl-4 pt-4 pr-4 pb-2 bg-blue-600">
        <div className="flex flex-col">
          <h1 className="text-black">
            Klinik<span className="text-white"> / Presensi</span>
          </h1>
          <span className="text-white font-bold">Presensi</span>
        </div>
        <UserAccount notifications={notifications} userName={session?.user?.name || "Guest"} />
      </div>
      <div className="bg-gray-50 text-gray-600 m-4 p-4 rounded-md shadow-md">
        <div className="flex justify-between">
          <h2 className="font-bold">Presensi</h2>
          <div className="flex space-x-2 p-2">
            {/* <PresensiButton tenagaMedis={tenagaMedis} /> */}
          </div>
        </div>
        <div>
          {/* revisi scan nik */}
          <KlinikScanner dataUser={tenagaMedis} />
        </div>
      </div>
    </div>
  );
};

export default PresensiTenagaMedis;
