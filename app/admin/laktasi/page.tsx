import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import prisma from "@/lib/db";
import ExportExcel from "./exportExcel";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

const LaktasiAdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const session = await getServerSession(AuthOptions);

  const dataList = await prisma.presensi.findMany({
    where: { tipe: "laktasi" },
    include: { pegawai: true },
    orderBy: { jam_masuk: "desc" },
  });

  const serializedDataList = dataList.map((item) => ({
    ...item,
    jam_masuk: item.jam_masuk.toISOString(),
    jam_keluar: item.jam_keluar ? item.jam_keluar.toISOString() : null,
  }));

  const resolvedSearchParams = await searchParams;
  const pageParam = Number(resolvedSearchParams.page || "1");
  const requestedPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const totalData = serializedDataList.length;
  const totalPages = Math.max(1, Math.ceil(totalData / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalData);
  const currentData = serializedDataList.slice(startIndex, startIndex + PAGE_SIZE);

  const buildPageHref = (page: number) => `?page=${page}`;

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
          <span className="text-gray-100 font-bold text-lg leading-none">Laktasi</span>
        </div>
        <div className="flex space-x-1">
          <UserAccount notifications={notifications} userName={session?.user?.name || "Admin"} />
        </div>
      </div>

      <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md m-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="font-bold text-black">Data Laktasi</h2>
          <ExportExcel users={serializedDataList}/>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3 rounded-tl-md border-b border-gray-300">Nama Pegawai</th>
                <th className="p-3 border-b border-gray-300">Tanggal</th>
                <th className="p-3 border-b border-gray-300">Mulai</th>
                <th className="p-3 border-b border-gray-300">Selesai</th>
                <th className="p-3 border-b border-gray-300 rounded-tr-md">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Belum ada data laktasi.
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id_presensi} className="border-b hover:bg-gray-100 transition duration-200">
                    <td className="p-3 font-medium text-gray-800">{item.pegawai?.nama_pegawai || "-"}</td>
                    <td className="p-3 text-gray-500">{new Date(item.jam_masuk).toLocaleDateString()}</td>
                    <td className="p-3 text-gray-500">{new Date(item.jam_masuk).toLocaleTimeString()}</td>
                    <td className="p-3 text-gray-500">
                      {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString() : "Masih berlangsung"}
                    </td>
                    <td className="p-3">
                      <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded-md text-xs font-semibold">
                        Laktasi
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-900">{totalData === 0 ? 0 : startIndex + 1}</span> -{" "}
            <span className="font-semibold text-gray-900">{endIndex}</span> dari{" "}
            <span className="font-semibold text-gray-900">{totalData}</span> data
          </span>

          <div className="flex items-center gap-2">
            <Link
              href={buildPageHref(Math.max(1, currentPage - 1))}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Prev</span>
            </Link>
            <span className="text-sm font-bold text-gray-700">
              Halaman {currentPage} / {totalPages}
            </span>
            <Link
              href={buildPageHref(Math.min(totalPages, currentPage + 1))}
              className={`px-3 py-1 rounded-md border text-sm ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
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

export default LaktasiAdminPage;
