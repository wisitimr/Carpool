"use client";

import { useState } from "react";
import { recordPayment, clearFullBalance } from "@/lib/admin-actions";
import { useT } from "@/lib/i18n-context";

interface DebtEntry {
  userId: string;
  userName: string | null;
  pendingDebt: number;
  totalDebt: number;
  totalPaid: number;
}

interface DebtSettlementProps {
  debts: DebtEntry[];
  cars: { id: string; name: string }[];
}

export default function DebtSettlement({ debts, cars }: DebtSettlementProps) {
  const { t } = useT();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [selectedCars, setSelectedCars] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const d of debts) {
      defaults[d.userId] = cars[0]?.id ?? "";
    }
    return defaults;
  });

  function toggleExpand(userId: string) {
    setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  async function handleClearFull(userId: string) {
    const carId = selectedCars[userId];
    if (!carId) return;
    const user = debts.find((d) => d.userId === userId);
    const carName = cars.find((c) => c.id === carId)?.name ?? "";
    const summary = `${t.clearFullBalance}?\n\n${user?.userName ?? "Unknown"}\n${t.pending}: ฿${user?.pendingDebt.toFixed(2)}\n${t.car}: ${carName}`;
    if (!confirm(summary)) return;
    setLoadingAction(`clear-${userId}`);
    try {
      await clearFullBalance(userId, carId);
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleRecordCustom(userId: string) {
    const carId = selectedCars[userId];
    const amount = parseFloat(customAmounts[userId] || "0");
    if (!carId || amount <= 0) return;
    const user = debts.find((d) => d.userId === userId);
    const carName = cars.find((c) => c.id === carId)?.name ?? "";
    const summary = `${t.recordPayment}?\n\n${user?.userName ?? "Unknown"}\n${t.amount}: ฿${amount.toFixed(2)}\n${t.car}: ${carName}`;
    if (!confirm(summary)) return;
    setLoadingAction(`record-${userId}`);
    try {
      await recordPayment(userId, carId, amount);
      setCustomAmounts((prev) => ({ ...prev, [userId]: "" }));
    } finally {
      setLoadingAction(null);
    }
  }

  const usersWithDebt = debts.filter((d) => d.pendingDebt > 0);

  if (usersWithDebt.length === 0) {
    return <p className="text-sm text-gray-500">{t.allBalancesCleared}</p>;
  }

  return (
    <div className="space-y-3">
      {usersWithDebt.map((d) => {
        const isExpanded = expandedUsers[d.userId] ?? false;
        const isClearLoading = loadingAction === `clear-${d.userId}`;
        const isRecordLoading = loadingAction === `record-${d.userId}`;
        const isAnyLoading = loadingAction !== null;
        return (
          <div
            key={d.userId}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{d.userName ?? "Unknown"}</p>
                <p className="text-sm text-gray-500">
                  {t.accrued}: ฿{d.totalDebt.toFixed(2)} &middot; {t.paid}:{" "}
                  ฿{d.totalPaid.toFixed(2)}
                </p>
                <p className="text-lg font-bold text-red-600">
                  {t.pending}: ฿{d.pendingDebt.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleClearFull(d.userId)}
                disabled={isAnyLoading}
                className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:py-2"
              >
                {t.clearFullBalance}{isClearLoading && "..."}
              </button>
            </div>

            <button
              onClick={() => toggleExpand(d.userId)}
              className="mt-2 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-700"
            >
              {t.customAmount}
              <svg className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Collapsible custom payment */}
            {isExpanded && (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-end">
                {cars.length > 1 && (
                  <div className="sm:shrink-0">
                    <label className="mb-1 block text-xs text-gray-500">{t.car}</label>
                    <select
                      value={selectedCars[d.userId] || ""}
                      onChange={(e) =>
                        setSelectedCars((prev) => ({
                          ...prev,
                          [d.userId]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm sm:w-auto sm:py-1.5"
                    >
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">
                    {t.amount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customAmounts[d.userId] || ""}
                    onChange={(e) =>
                      setCustomAmounts((prev) => ({
                        ...prev,
                        [d.userId]: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:py-1.5"
                  />
                </div>
                <button
                  onClick={() => handleRecordCustom(d.userId)}
                  disabled={
                    isAnyLoading ||
                    !customAmounts[d.userId] ||
                    parseFloat(customAmounts[d.userId] || "0") <= 0
                  }
                  className="w-full shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 sm:w-auto sm:py-1.5"
                >
                  {t.recordPayment}{isRecordLoading && "..."}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
