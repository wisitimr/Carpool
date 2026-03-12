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
