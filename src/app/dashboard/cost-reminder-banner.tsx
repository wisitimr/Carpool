"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n-context";

interface MissingEntry {
  carId: string;
  date: string;
}

export default function CostReminderBanner({ initialMissingDates }: { initialMissingDates: MissingEntry[] }) {
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

  const uniqueDates = [...new Set(missingDates.map((e) => e.date))];

  return (
    <a
      href="#enter-daily-costs"
      className="animate-fade-in mb-4 block rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 shadow-sm transition hover:bg-amber-100 sm:mb-6"
    >
      <p className="font-medium">{t.costReminderBanner}</p>
      <p className="mt-1 text-xs text-amber-600">
        {t.missingDates}: {uniqueDates.length <= 3
          ? uniqueDates.join(", ")
          : `${uniqueDates.slice(0, 3).join(", ")} ...+${uniqueDates.length - 3}`}
        {missingDates.length > uniqueDates.length && ` (${missingDates.length} entries)`}
      </p>
    </a>
  );
}
