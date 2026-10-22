const TZ = "Asia/Tokyo";

/** Asia/Tokyo の暦日 0:00 を UTC Date で返す */
export function startOfTokyoDay(base = new Date()): Date {
  const key = base.toLocaleDateString("en-CA", { timeZone: TZ });
  return new Date(`${key}T00:00:00+09:00`);
}

export function addTokyoDays(start: Date, days: number): Date {
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

export function parsePeriod(
  from?: string | null,
  to?: string | null,
): { start: Date; end: Date } {
  const end = to ? new Date(`${to}T00:00:00+09:00`) : addTokyoDays(startOfTokyoDay(), 1);
  const start = from
    ? new Date(`${from}T00:00:00+09:00`)
    : addTokyoDays(end, -30);
  if (!(start < end)) {
    return { start: addTokyoDays(end, -30), end };
  }
  return { start, end };
}
