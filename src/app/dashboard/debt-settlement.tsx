"use client";

import { useState } from "react";
import { clearFullBalance } from "@/lib/admin-actions";
import { useT } from "@/lib/i18n-context";

interface BreakdownItem {
  carName: string;
  date: string;
  share: number;
  gasShare: number;
  parkingShare: number;
  passengerCount: number;
}

interface DebtEntry {
  userId: string;
  userName: string | null;
  pendingDebt: number;
  totalDebt: number;
  totalPaid: number;
  breakdown: BreakdownItem[];
}

interface DebtSettlementProps {
  debts: DebtEntry[];
  cars: { id: string; name: string }[];
}

export default function DebtSettlement({ debts, cars }: DebtSettlementProps) {
  const { t } = useT();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedCars, setSelectedCars] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const d of debts) {
      defaults[d.userId] = cars[0]?.id ?? "";
    }
    return defaults;
  });

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

  function getPendingBreakdown(d: DebtEntry): BreakdownItem[] {
    const sorted = [...d.breakdown];
    let remaining = d.totalPaid;
    const pending: BreakdownItem[] = [];
    for (const entry of sorted) {
      if (remaining >= entry.share) {
        remaining = Math.round((remaining - entry.share) * 100) / 100;
      } else if (remaining > 0) {
        const ratio = (entry.share - remaining) / entry.share;
        pending.push({
          ...entry,
          share: Math.round((entry.share - remaining) * 100) / 100,
          gasShare: Math.round(entry.gasShare * ratio * 100) / 100,
          parkingShare: Math.round(entry.parkingShare * ratio * 100) / 100,
        });
        remaining = 0;
      } else {
        pending.push(entry);
      }
    }
    pending.reverse();
    return pending;
  }

  const usersWithDebt = debts.filter((d) => d.pendingDebt > 0);

  if (usersWithDebt.length === 0) {
    return <p className="text-sm text-gray-500">{t.allBalancesCleared}</p>;
  }

  return (
    <div className="space-y-3">
      {usersWithDebt.map((d) => {
        const isClearLoading = loadingAction === `clear-${d.userId}`;
        const isAnyLoading = loadingAction !== null;
        const pendingBreakdown = getPendingBreakdown(d);
        return (
          <div
            key={d.userId}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{d.userName ?? "Unknown"}</p>
                <p className="text-lg font-bold text-red-600">
                  ฿{d.pendingDebt.toFixed(2)}
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

            {pendingBreakdown.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                  {t.viewCostBreakdown}
                </summary>
                <ul className="mt-3 divide-y divide-gray-100 text-sm">
                  {pendingBreakdown.map((b, i) => (
                    <li key={i} className="py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-gray-600">
                          {b.carName} &mdash; {b.date} ({b.passengerCount} {t.riders})
                        </span>
                        <span className="shrink-0 font-medium text-gray-900">
                          ฿{b.share.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex gap-3 text-xs text-gray-400">
                        {b.gasShare > 0 && (
                          <span>{t.gas}: ฿{b.gasShare.toFixed(2)}</span>
                        )}
                        {b.parkingShare > 0 && (
                          <span>{t.parking}: ฿{b.parkingShare.toFixed(2)}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
