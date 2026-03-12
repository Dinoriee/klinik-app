import { Search} from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import TambahUserButton from "@/components/ui/TambahUserButton";
import EditUserButton from "@/components/ui/EditUserButton";
import DeleteUserButton from "@/components/ui/DeleteUserButton";
import UserAccount from "@/components/ui/userAccount";


const KelolaUser = async () => {
  const session = await getServerSession(AuthOptions);
  console.log(session);

  const users = await prisma.user.findMany({
    orderBy: {
      role: "desc",
    },
    include: {
        tenagaMedis: true,
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
            Klinik<span className="text-black"> / Kelola User</span>
          </h1>
          <span className="text-black font-bold">Kelola User</span>
        </div>
        {}
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Guest"} />
        </div>
      </div>
      <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md m-4">
        <div className="flex justify-between">
          <h2 className="font-bold">Data User</h2>
          <div className="flex space-x-2 p-2">
            <TambahUserButton/>
            <div className="flex relative">
              <Search
                size={16}
                className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                className="pl-6 border rounded-md border-gray-300 h-8"
                placeholder="Cari disini..."
              />
            </div>
          </div>
        </div>
        <table className="w-full mt-6 border-collapse text-left text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 rounded-tl-md border-b border-gray-300">
                Nama User
              </th>
              <th className="p-3 border-b border-gray-300">Email</th>
              <th className="p-3 border-b border-gray-300">Role</th>
              <th className="p-3 text-center rounded-tr-md border-b border-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr
                key={item.id_user}
                className="border-b hover:bg-gray-100 transition duration-200"
              >
                <td className="p-3 font-medium text-gray-800">
                  {item.tenagaMedis?.nama_tenaga_medis || "Admin"}
                </td>
                <td className="p-3 text-gray-500">{item.email}</td>
                <td className="p-3 capitalize">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">
                    {item.role}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <EditUserButton user={item}/>
                  <DeleteUserButton userId={item.id_user}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaUser;
