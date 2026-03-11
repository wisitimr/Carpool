import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDebts } from "@/lib/cost-splitting";
import { Role } from "@prisma/client";
import { SignOutButton } from "@clerk/nextjs";
import UserManagement from "./user-management";
import DateManagement from "./date-management";
import CostManagement from "./cost-management";
import SystemPauseToggle from "./system-pause-toggle";
import DebtSettlement from "./debt-settlement";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== Role.ADMIN) redirect("/dashboard");

  const userId = user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fetch all data in parallel
  const [allUsers, disabledDates, myCars, systemPausedConfig, debts] =
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
      calculateDebts(startOfMonth, endOfMonth),
    ]);

  const isSystemPaused = systemPausedConfig?.value === "true";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {user.name ?? user.email}
            <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-500/20 ring-inset">
              Admin
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/qr"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
          >
            QR Code
          </a>
          <a
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            Dashboard
          </a>
          <SignOutButton>
            <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* System Pause Toggle */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-200">
        <div className="border-b border-orange-100 bg-orange-50/50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            System Status
          </h2>
        </div>
        <div className="px-6 py-5">
          <SystemPauseToggle isPaused={isSystemPaused} />
        </div>
      </section>

      {/* User Management */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-red-200">
        <div className="border-b border-red-100 bg-red-50/50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-600">
            User Management
          </h2>
        </div>
        <div className="px-6 py-5">
          <UserManagement
            users={allUsers.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
            }))}
            currentUserId={userId}
          />
        </div>
      </section>

      {/* Cost Management */}
      {myCars.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-200">
          <div className="border-b border-blue-100 bg-blue-50/50 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Cost Management
            </h2>
          </div>
          <div className="px-6 py-5">
            <CostManagement
              cars={myCars.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
        </section>
      )}

      {/* Debt Settlement */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-green-200">
        <div className="border-b border-green-100 bg-green-50/50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-green-600">
            Debt Settlement
          </h2>
        </div>
        <div className="px-6 py-5">
          <DebtSettlement
            debts={debts.map((d) => ({
              userId: d.userId,
              userName: d.userName,
              pendingDebt: d.pendingDebt,
              totalDebt: d.totalDebt,
              totalPaid: d.totalPaid,
            }))}
            cars={myCars.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      </section>

      {/* Operating Days */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
            Operating Days
          </h2>
        </div>
        <div className="px-6 py-5">
          <DateManagement
            disabledDates={disabledDates.map((d) => ({
              id: d.id,
              date: d.date.toISOString().split("T")[0],
              reason: d.reason,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
