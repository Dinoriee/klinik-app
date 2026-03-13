import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import { ensureAktivitasMedisTable } from "@/lib/medisAktivitas";
import KlinikScanner from "@/components/ui/ScannerPresensi";
import prisma from "@/lib/db";

const IstirahatHamilMedisPage = async () => {
  const session = await getServerSession(AuthOptions);
  await ensureAktivitasMedisTable();

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
            Klinik<span className="text-white"> / Istirahat Hamil</span>
          </h1>
          <span className="text-white font-bold">Istirahat Hamil</span>
        </div>
        <UserAccount notifications={notifications} userName={session?.user?.name || "Guest"} />
      </div>

      <div className="mx-4 mb-4 space-y-4">
        <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-bold text-white">Pengajuan Istirahat Hamil</h2>
          </div>
          <div className="mt-4">
            <KlinikScanner dataUser={tenagaMedis} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IstirahatHamilMedisPage;
