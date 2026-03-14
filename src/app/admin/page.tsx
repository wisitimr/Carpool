import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { detectLocale, getTranslations } from "@/lib/i18n";
import { Settings } from "lucide-react";
import UserManagement from "./user-management";
import CarManagement from "./car-management";
import QRTab from "./qr-tab";
import SettingsTabs from "./settings-tabs";
import BottomNav from "@/app/dashboard/bottom-nav";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== Role.ADMIN) redirect("/dashboard");

  const headersList = await headers();
  const locale = detectLocale(headersList.get("accept-language"));
  const t = getTranslations(locale);

  const userId = user.id;

  const [allUsers, myCars] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.car.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, licensePlate: true, defaultGasCost: true },
    }),
  ]);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {t.settings}
            </h1>
            <p className="text-xs text-muted-foreground">{t.settingsSubtitle}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
      <SettingsTabs
        usersTab={
          <UserManagement
            users={allUsers.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
            }))}
            currentUserId={userId}
          />
        }
        carsTab={
          <CarManagement
            cars={myCars.map((c) => ({
              id: c.id,
              name: c.name,
              licensePlate: c.licensePlate,
              defaultGasCost: c.defaultGasCost,
            }))}
          />
        }
        qrTab={
          <QRTab
            cars={myCars.map((c) => ({
              id: c.id,
              name: c.name,
              licensePlate: c.licensePlate,
            }))}
          />
        }
      />
      </main>

      <BottomNav isAdmin={true} />
    </div>
  );
}
