"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Reusable authorization guard — ensures only ADMIN (Car Owners) can proceed
// ---------------------------------------------------------------------------
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden: admin access required");
  }
  return session.user;
}

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

/** Approve a PENDING user → USER */
export async function approveUser(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.USER },
  });
  revalidatePath("/admin");
}

/** Revoke a USER → back to PENDING */
export async function revokeUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("Cannot revoke your own access");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.PENDING },
  });
  revalidatePath("/admin");
}

/** Set any user's role (with safeguards) */
export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();

  // Prevent admin from demoting themselves
  if (userId === admin.id && role !== Role.ADMIN) {
    throw new Error("Cannot change your own role");
  }

  // If promoting to ADMIN, the user should own at least one car
  // (ADMIN = Car Owner by definition). Skip this check for demotions.
  if (role === Role.ADMIN) {
    const carCount = await prisma.car.count({ where: { ownerId: userId } });
    if (carCount === 0) {
      throw new Error("Only car owners can be promoted to ADMIN. Assign a car first.");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Cost Management — Admin can update gas/parking for their owned cars
// ---------------------------------------------------------------------------

export async function updateDailyCost(
  carId: string,
  date: string,
  gasCost: number,
  parkingCost: number
) {
  const admin = await requireAdmin();

  // Verify the admin owns this car
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || car.ownerId !== admin.id) {
    throw new Error("Forbidden: you do not own this car");
  }

  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);

  await prisma.dailyCost.upsert({
    where: { carId_date: { carId, date: parsedDate } },
    update: { gasCost, parkingCost },
    create: { carId, date: parsedDate, gasCost, parkingCost },
  });

  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// System Configuration — Disabled Dates (holidays / maintenance)
// ---------------------------------------------------------------------------

/** Disable the system for a specific date */
export async function disableDate(date: string, reason?: string) {
  await requireAdmin();
  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);

  await prisma.disabledDate.upsert({
    where: { date: parsedDate },
    update: { reason: reason || null },
    create: { date: parsedDate, reason: reason || null },
  });
  revalidatePath("/admin");
}

/** Re-enable the system for a specific date */
export async function enableDate(date: string) {
  await requireAdmin();
  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);

  await prisma.disabledDate
    .delete({ where: { date: parsedDate } })
    .catch(() => {
      // Silently ignore if date wasn't disabled
    });
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// System-wide pause toggle (via SystemConfig)
// ---------------------------------------------------------------------------

/** Toggle the global system pause */
export async function setSystemPaused(paused: boolean) {
  await requireAdmin();

  await prisma.systemConfig.upsert({
    where: { key: "system_paused" },
    update: { value: paused ? "true" : "false" },
    create: { key: "system_paused", value: paused ? "true" : "false" },
  });
  revalidatePath("/admin");
}

/** Check if the system is globally paused */
export async function isSystemPaused(): Promise<boolean> {
  const config = await prisma.systemConfig.findUnique({
    where: { key: "system_paused" },
  });
  return config?.value === "true";
}
