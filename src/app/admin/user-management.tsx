"use client";

import { useState } from "react";
import { approveUser, deleteUser, setUserRole } from "@/lib/admin-actions";
import { useT } from "@/lib/i18n-context";
import type { Role } from "@prisma/client";

interface UserManagementProps {
  users: { id: string; name: string | null; email: string; role: Role }[];
  currentUserId: string;
}

const roleBadge: Record<Role, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  USER: "bg-green-100 text-green-800",
  ADMIN: "bg-red-100 text-red-800",
};

export default function UserManagement({ users, currentUserId }: UserManagementProps) {
  const { t } = useT();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  function toggleUser(id: string) {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApprove(userId: string) {
    setLoadingAction(`approve-${userId}`);
    try {
      await approveUser(userId);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm(t.confirmDeleteUser)) return;
    setLoadingAction(`delete-${userId}`);
    try {
      await deleteUser(userId);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    setLoadingAction(`role-${userId}`);
    try {
      await setUserRole(userId, newRole);
    } finally {
      setLoadingAction(null);
    }
  }

  const isAnyLoading = loadingAction !== null;
  const pendingUsers = users.filter((u) => u.role === "PENDING");
  const activeUsers = users.filter((u) => u.role !== "PENDING");

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-yellow-700">
            {t.pendingApproval} ({pendingUsers.length})
          </h3>
          <ul className="space-y-2">
            {pendingUsers.map((user) => (
              <li
                key={user.id}
                className="rounded-xl bg-yellow-50"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name ?? t.noName}</p>
                    <p className="truncate text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={isAnyLoading}
                      className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
                    >
                      {t.approve}{loadingAction === `approve-${user.id}` && "..."}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={isAnyLoading}
                      className="shrink-0 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
                    >
                      {t.deleteUser}{loadingAction === `delete-${user.id}` && "..."}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pendingUsers.length === 0 && (
        <p className="text-sm text-gray-500">{t.noPendingUsers}</p>
      )}

      {/* Active Users */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-600">
          {t.activeUsers} ({activeUsers.length})
        </h3>
        <ul className="space-y-2">
          {activeUsers.map((user) => {
            const isMe = user.id === currentUserId;
            const isExpanded = expandedUsers.has(user.id);
            return (
              <li key={user.id} className="rounded-xl bg-gray-50">
                <button
                  type="button"
                  onClick={() => !isMe && toggleUser(user.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left ${isMe ? "cursor-default" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name ?? t.noName}</p>
                      <p className="truncate text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  {!isMe && (
                    <svg
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  )}
                </button>

                {isExpanded && !isMe && (
                  <div className="border-t border-gray-100 px-4 pb-3 pt-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        disabled={isAnyLoading}
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isAnyLoading}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
                      >
                        {t.deleteUser}{loadingAction === `delete-${user.id}` && "..."}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
