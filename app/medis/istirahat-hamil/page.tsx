import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import InputNikIstirahatHamil from "@/components/ui/InputNikIstirahatHamil";
import ScannerIstirahatHamil from "@/components/ui/ScannerIstirahatHamil";
import { ensureAktivitasMedisTable } from "@/lib/medisAktivitas";

const IstirahatHamilMedisPage = async () => {
  const session = await getServerSession(AuthOptions);
  await ensureAktivitasMedisTable();

  return (
    <div>
      <div className="flex justify-between p-4">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik<span className="text-black"> / Istirahat Hamil</span>
          </h1>
          <span className="text-black font-bold">Istirahat Hamil</span>
        </div>
        <UserAccount userName={session?.user?.name} />
      </div>

      <div className="mx-4 mb-4 space-y-4">
        <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-bold text-black">Pengajuan Istirahat Hamil</h2>
          </div>
          <div className="mt-4">
            <ScannerIstirahatHamil />
          </div>
          <div className="mt-4">
            <InputNikIstirahatHamil />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IstirahatHamilMedisPage;
