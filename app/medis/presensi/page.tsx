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

  const tenagaMedis = await prisma.tenaga_Medis.findMany({
    select: {
      id_tenaga_medis: true,
      nama_tenaga_medis: true,
      nik: true,
    },
  });

  return (
    <div>
      <div className="flex justify-between p-4 spacey4">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik<span className="text-black"> / Presensi</span>
          </h1>
          <span className="text-black font-bold">Presensi</span>
        </div>
        <UserAccount userName={session?.user?.name} />
      </div>
      <div className="bg-gray-50 text-gray-600 m-4 p-4 rounded-md shadow-md">
        <div className="flex justify-between">
          <h2 className="font-bold">Presensi</h2>
          <div className="flex space-x-2 p-2">
            <PresensiButton tenagaMedis={tenagaMedis} />
          </div>
        </div>
        <div>
          {/* revisi scan nik */}
          <KlinikScanner tenagaMedis={tenagaMedis} />
        </div>
        <NikInput tenagaMedis={tenagaMedis}/>
      </div>
    </div>
  );
};

export default PresensiTenagaMedis;
