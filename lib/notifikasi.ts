import prisma from "@/lib/db";

const EXPIRY_WARNING_DAYS = 30;

const getExpiryThreshold = () => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + EXPIRY_WARNING_DAYS);
  return threshold;
};

const createLowStockMessage = (namaObat: string) => {
  return `Peringatan: Stok obat ${namaObat} mendekati batas minimum.`;
};

const createExpiryMessage = (namaObat: string) => {
  return `Peringatan: Obat ${namaObat} akan segera kedaluwarsa.`;
};

export async function syncMedicineNotifications() {
  const medicines = await prisma.obat.findMany({
    select: {
      id_obat: true,
      nama_obat: true,
      stok_saat_ini: true,
      reorder_level: true,
      expired_date: true,
    },
  });

  const existingNotifications = await prisma.notifikasi.findMany({
    select: {
      id_notifikasi: true,
      id_obat: true,
      pesan: true,
    },
  });

  const activeEntries = new Map<string, { id_obat: string; pesan: string }>();
  const expiryThreshold = getExpiryThreshold();
  const now = new Date();

  for (const medicine of medicines) {
    if (medicine.stok_saat_ini <= medicine.reorder_level) {
      const pesan = createLowStockMessage(medicine.nama_obat);
      activeEntries.set(`${medicine.id_obat}:${pesan}`, {
        id_obat: medicine.id_obat,
        pesan,
      });
    }

    if (medicine.expired_date >= now && medicine.expired_date <= expiryThreshold) {
      const pesan = createExpiryMessage(medicine.nama_obat);
      activeEntries.set(`${medicine.id_obat}:${pesan}`, {
        id_obat: medicine.id_obat,
        pesan,
      });
    }
  }

  const existingKeys = new Set(
    existingNotifications.map((notification) => `${notification.id_obat}:${notification.pesan}`)
  );

  const notificationsToCreate = Array.from(activeEntries.entries())
    .filter(([key]) => !existingKeys.has(key))
    .map(([, value]) => ({
      ...value,
      status: "unread",
    }));

  const notificationsToDelete = existingNotifications
    .filter((notification) => !activeEntries.has(`${notification.id_obat}:${notification.pesan}`))
    .map((notification) => notification.id_notifikasi);

  if (notificationsToDelete.length > 0) {
    await prisma.notifikasi.deleteMany({
      where: {
        id_notifikasi: {
          in: notificationsToDelete,
        },
      },
    });
  }

  if (notificationsToCreate.length > 0) {
    await prisma.notifikasi.createMany({
      data: notificationsToCreate,
    });
  }

  return {
    created: notificationsToCreate.length,
    deleted: notificationsToDelete.length,
  };
}
