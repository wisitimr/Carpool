"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n-context";

interface MissingEntry {
  carId: string;
  date: string;
}

interface CostReminderBannerProps {
  initialMissingDates: MissingEntry[];
  cars: { id: string; name: string }[];
}

export default function CostReminderBanner({ initialMissingDates, cars }: CostReminderBannerProps) {
  const { t } = useT();
  const [missingDates, setMissingDates] = useState(initialMissingDates);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<MissingEntry[]>).detail;
      setMissingDates(detail);
    }
    window.addEventListener("missing-dates-update", handler);
    return () => window.removeEventListener("missing-dates-update", handler);
  }, []);

  if (missingDates.length === 0) return null;

  const carName = (id: string) => cars.find((c) => c.id === id)?.name ?? "";

  // Group by date for display
  const grouped = new Map<string, string[]>();
  for (const entry of missingDates) {
    const names = grouped.get(entry.date) ?? [];
    names.push(carName(entry.carId));
    grouped.set(entry.date, names);
  }
  const entries = [...grouped.entries()].slice(0, 3);

  return (
    <a
      href="#enter-daily-costs"
      className="animate-fade-in mb-4 block rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 shadow-sm transition hover:bg-amber-100 sm:mb-6"
    >
      <p className="font-medium">{t.costReminderBanner}</p>
      <div className="mt-1.5 space-y-1 text-xs text-amber-600">
        {entries.map(([date, names]) => (
          <p key={date}>
            {date} — {names.join(", ")}
          </p>
        ))}
        {grouped.size > 3 && (
          <p>...+{grouped.size - 3}</p>
        )}
      </div>
    </a>
  );
}
