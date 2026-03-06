import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import ScannerLaktasi from "@/components/ui/ScannerLaktasi";
import InputNikLaktasi from "@/components/ui/InputNikLaktasi";

const LaktasiMedisPage = async () => {
  const session = await getServerSession(AuthOptions);

  return (
    <div>
      <div className="flex justify-between p-4">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik<span className="text-black"> / Laktasi</span>
          </h1>
          <span className="text-black font-bold">Laktasi</span>
        </div>
        <UserAccount userName={session?.user?.name} />
      </div>

      <div className="mx-4 mb-4 space-y-4">
        <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-bold text-black">Pengajuan Laktasi</h2>
          </div>
          <div className="mt-4">
            <ScannerLaktasi />
          </div>
          <div className="mt-4">
            <InputNikLaktasi />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaktasiMedisPage;
