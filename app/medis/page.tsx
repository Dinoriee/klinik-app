import UserAccount from "@/components/ui/userAccount";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

const DashboardMedis = async () => {
  const session = await getServerSession(AuthOptions);
  console.log(session);

  return (
    <div className="h-full">
      <div className="flex justify-between p-4">
        <div className="flex flex-col">
          <h1 className="text-gray-400">
            Klinik<span className="text-black"> / Kelola User</span>
          </h1>
          <span className="text-black font-bold">Kelola User</span>
        </div>
        <UserAccount userName={session?.user?.name}/>
      </div>
      <div className="flex justify-center items-center h-full text-black">
        <h1>Ini Dashboard Tenaga Medis</h1>
      </div>
    </div>
  );
};

export default DashboardMedis;
