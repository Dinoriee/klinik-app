import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import TambahUserButton from "@/components/ui/TambahUserButton";
import EditUserButton from "@/components/ui/EditUserButton";
import DeleteUserButton from "@/components/ui/DeleteUserButton";
import UserAccount from "@/components/ui/userAccount";
import ExportExcel from "./exportExcel";
import Link from "next/link";

const PAGE_SIZE = 10;

const KelolaUser = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) => {
  const session = await getServerSession(AuthOptions);
  console.log(session);

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
  const pageParam = Number(resolvedSearchParams.page || "1");
  const requestedPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
          {
            tenagaMedis: {
              is: { nama_tenaga_medis: { contains: query, mode: "insensitive" as const } },
            },
          },
        ],
      }
    : {};

  const totalData = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  const [users, allUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { role: "desc" },
      include: { tenagaMedis: true },
      skip: startIndex,
      take: PAGE_SIZE,
    }),
    prisma.user.findMany({
      where,
      orderBy: { role: "desc" },
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

  return (
    <div>
      <div className="flex justify-between items-center px-4 py-3 bg-blue-600">
        <div className="flex flex-col">
          <span className="text-gray-100 font-bold text-lg leading-none">Kelola User</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Admin"} />
        </div>
      </div>
      <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md m-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="font-bold">Data User</h2>
          <div className="flex items-center gap-3">
            <form method="GET" className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                className="pl-9 pr-4 py-2 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
                placeholder="Cari disini..."
              />
              <button type="submit" className="hidden">
                Cari
              </button>
            </form>
            <TambahUserButton />
            <ExportExcel users={allUsers} />
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
                <td className="p-3">
                  <div className="flex justify-center items-center gap-2">
                    <EditUserButton user={item} />
                    <DeleteUserButton userId={item.id_user} />
                  </div>
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
              className={`px-3 py-1 border rounded-md ${
                currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Prev</span>
            </Link>
            <span className="font-bold text-gray-700">
              Halaman {currentPage} / {totalPages}
            </span>
            <Link
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              className={`px-3 py-1 border rounded-md ${
                currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
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

export default KelolaUser;
