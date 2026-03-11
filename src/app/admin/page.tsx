import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import UserManagement from "./user-management";
import DateManagement from "./date-management";
import CostManagement from "./cost-management";
import SystemPauseToggle from "./system-pause-toggle";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");

  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all data in parallel
  const [allUsers, disabledDates, myCars, systemPausedConfig] =
    await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        orderBy: [{ role: "asc" }, { name: "asc" }],
      }),
      prisma.disabledDate.findMany({
        where: { date: { gte: today } },
        orderBy: { date: "asc" },
      }),
      prisma.car.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true },
      }),
      prisma.systemConfig.findUnique({
        where: { key: "system_paused" },
      }),
    ]);

  const isSystemPaused = systemPausedConfig?.value === "true";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            Car Owner: {session.user.name ?? session.user.email}
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Admin
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard"
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Dashboard
          </a>
          <a
            href="/api/auth/signout"
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Sign Out
          </a>
        </div>
      </header>

      {/* System Pause Toggle */}
      <section className="mb-8 rounded-lg border-2 border-orange-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-orange-700">
          System Status
        </h2>
        <SystemPauseToggle isPaused={isSystemPaused} />
      </section>

      {/* User Management */}
      <section className="mb-8 rounded-lg border-2 border-red-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-red-700">
          User Management
        </h2>
        <UserManagement
          users={allUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
          }))}
          currentUserId={userId}
        />
      </section>

      {/* Cost Management */}
      {myCars.length > 0 && (
        <section className="mb-8 rounded-lg border-2 border-blue-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-blue-700">
            Cost Management
          </h2>
          <CostManagement
            cars={myCars.map((c) => ({ id: c.id, name: c.name }))}
          />
        </section>
      )}

      {/* Date / System Configuration */}
      <section className="rounded-lg border-2 border-red-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-red-700">
          Operating Days
        </h2>
        <DateManagement
          disabledDates={disabledDates.map((d) => ({
            id: d.id,
            date: d.date.toISOString().split("T")[0],
            reason: d.reason,
          }))}
        />
      </section>
    </main>
  );
}
