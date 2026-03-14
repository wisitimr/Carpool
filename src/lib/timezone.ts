const TZ = "Asia/Bangkok";

/** Get current time in Bangkok timezone */
export function nowBangkok(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: TZ })
  );
}

/** Get start of today (00:00:00) in Bangkok timezone */
export function todayBangkok(): Date {
  const d = nowBangkok();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get start of month in Bangkok timezone */
export function startOfMonthBangkok(): Date {
  const d = nowBangkok();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Get end of month in Bangkok timezone */
export function endOfMonthBangkok(): Date {
  const d = nowBangkok();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Convert a date string (YYYY-MM-DD) to UTC midnight Date.
 * Use this for all DB operations with @db.Date fields to ensure
 * consistent date matching regardless of server timezone.
 */
export function bangkokDateToUTC(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

/**
 * Get today's Bangkok date as UTC midnight Date.
 * Combines nowBangkok() to determine the current Bangkok date,
 * then returns UTC midnight for that date.
 */
export function todayBangkokUTC(): Date {
  const d = nowBangkok();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${day}T00:00:00Z`);
}
