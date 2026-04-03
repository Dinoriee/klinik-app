import { ChevronLeft, ChevronRight, Download, Search} from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import TambahUserButton from "@/components/ui/TambahUserButton";
import EditUserButton from "@/components/ui/EditUserButton";
import DeleteUserButton from "@/components/ui/DeleteUserButton";
import UserAccount from "@/components/ui/userAccount";
import ExcelButton from "./exportExcel";
import Link from "next/link";

const PAGE_SIZE = 10;

const PresensiAdmin = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const session = await getServerSession(AuthOptions);
  console.log(session);

  const resolvedSearchParams = await searchParams;
  const pageParam = Number(resolvedSearchParams.page || "1");
  const requestedPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const totalData = await prisma.presensi_Tenaga_Medis.count();
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const [users, allUsers] = await Promise.all([
    prisma.presensi_Tenaga_Medis.findMany({
      orderBy: { jam_masuk: "desc" },
      include: { tenagaMedis: true },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.presensi_Tenaga_Medis.findMany({
      orderBy: { jam_masuk: "desc" },
      include: { tenagaMedis: true },
    }),
  ]);

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

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const buildPageHref = (page: number) => `?page=${page}`;
  

  return (
    <div>
      <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg leading-none">Presensi</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Admin"} />
        </div>
      </div>
      <div className="bg-gray-50 text-black p-4 rounded-md shadow-md m-4 border">
        <div className="flex justify-between border-b items-center">
          <h2 className="font-bold">Data User</h2>
          <div className="flex space-x-2 p-2">
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
            <ExcelButton users={allUsers}/>
          </div>
        </div>
        <table className="w-full mt-6 border-collapse text-left text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 rounded-tl-md border-b border-gray-300">
                Nama User
              </th>
              <th className="p-3 border-b border-gray-300">Tanggal</th>
              <th className="p-3 border-b border-gray-300">Jam Masuk</th>
              <th className="p-3 border-b border-gray-300">Jam Keluar</th>
              <th className="p-3 border-b border-gray-300">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr
                key={item.id_presensi}
                className="border-b hover:bg-gray-100 transition duration-200"
              >
                <td className="p-3 font-medium text-gray-800">
                  {item.tenagaMedis?.nama_tenaga_medis || "Admin"}
                </td>
                <td className="p-3 text-gray-500">{item.jam_masuk.toLocaleDateString()}</td>
                <td className="p-3 text-gray-500">{item.jam_masuk.toLocaleTimeString()}</td>
                <td className="p-3 text-gray-500">{item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString() : "Belum melakukan check-out"}</td>
                <td className="p-3 capitalize flex">
                  {item.keterangan === "hadir" ? (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">
                      {item.keterangan}
                    </span>
                  ) :  (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold">
                      {item.keterangan}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
          <div>
            Menampilkan{" "}
            <span className="font-semibold text-gray-900">{totalData === 0 ? 0 : startIndex + 1}</span> -{" "}
            <span className="font-semibold text-gray-900">{Math.min(startIndex + PAGE_SIZE, totalData)}</span> dari{" "}
            <span className="font-semibold text-gray-900">{totalData}</span> data
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={buildPageHref(Math.max(1, currentPage - 1))}
              className={`px-3 py-1 border rounded-md ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Prev</span>
            </Link>
            <span className="font-bold text-gray-700">Halaman {currentPage} / {totalPages}</span>
            <Link
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
            >
              <ChevronRight size={16} />
              <span className="sr-only">Next</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresensiAdmin;
