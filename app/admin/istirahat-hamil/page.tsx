import { AuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import UserAccount from "@/components/ui/userAccount";
import { ensureAktivitasMedisTable, getRiwayatAktivitasMedis } from "@/lib/medisAktivitas";
import prisma from "@/lib/db";

const IstirahatHamilAdminPage = async () => {
  const session = await getServerSession(AuthOptions);
  await ensureAktivitasMedisTable();

  const riwayatIstirahatHamil = await getRiwayatAktivitasMedis("istirahat_hamil");

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

      <div className="bg-gray-50 text-gray-600 p-4 rounded-md shadow-md mx-4 mb-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="font-bold text-black">Data Istirahat Hamil</h2>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3 rounded-tl-md border-b border-gray-300">Nama Tenaga Medis</th>
                <th className="p-3 border-b border-gray-300">Tanggal</th>
                <th className="p-3 border-b border-gray-300">Mulai</th>
                <th className="p-3 border-b border-gray-300">Selesai</th>
                <th className="p-3 border-b border-gray-300 rounded-tr-md">Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayatIstirahatHamil.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Belum ada data istirahat hamil.
                  </td>
                </tr>
              ) : (
                riwayatIstirahatHamil.map((item) => (
                  <tr key={item.id_presensi} className="border-b hover:bg-gray-100 transition duration-200">
                    <td className="p-3 font-medium text-gray-800">{item.nama_tenaga_medis || "-"}</td>
                    <td className="p-3 text-gray-500">{item.jam_masuk.toLocaleDateString()}</td>
                    <td className="p-3 text-gray-500">{item.jam_masuk.toLocaleTimeString()}</td>
                    <td className="p-3 text-gray-500">
                      {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString() : "Masih berlangsung"}
                    </td>
                    <td className="p-3">
                      <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-md text-xs font-semibold">
                        Istirahat Hamil
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IstirahatHamilAdminPage;
