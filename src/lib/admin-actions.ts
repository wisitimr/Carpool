"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  if (session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden: admin access required");
  }
  return session.user;
}

// --- User Role Management ---

export async function approveUser(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.USER },
  });
  revalidatePath("/dashboard");
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();

  // Prevent admin from demoting themselves
  if (userId === admin.id && role !== Role.ADMIN) {
    throw new Error("Cannot change your own role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/dashboard");
}

// --- Disabled Date Management ---

export async function disableDate(date: string, reason?: string) {
  await requireAdmin();
  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);

  await prisma.disabledDate.upsert({
    where: { date: parsedDate },
    update: { reason: reason || null },
    create: { date: parsedDate, reason: reason || null },
  });
  revalidatePath("/dashboard");
}

export async function enableDate(date: string) {
  await requireAdmin();
  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);

  await prisma.disabledDate.delete({
    where: { date: parsedDate },
  }).catch(() => {
    // Silently ignore if date wasn't disabled
  });
  revalidatePath("/dashboard");
}
