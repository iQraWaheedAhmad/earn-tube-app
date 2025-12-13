export function getUtcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getNextUtcMidnight(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0)
  );
}

// Timezone-offset based helpers (for user-local midnight resets).
// `tzOffsetMinutes` matches `Date.prototype.getTimezoneOffset()`:
// number of minutes to add to local time to get UTC (UTC - local).
function toLocalDate(d: Date, tzOffsetMinutes: number): Date {
  return new Date(d.getTime() - tzOffsetMinutes * 60_000);
}

function toUtcFromLocal(local: Date, tzOffsetMinutes: number): Date {
  return new Date(local.getTime() + tzOffsetMinutes * 60_000);
}

export function getDateKeyForTzOffset(
  d: Date,
  tzOffsetMinutes: number
): string {
  const local = toLocalDate(d, tzOffsetMinutes);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getNextLocalMidnightUtc(
  d: Date,
  tzOffsetMinutes: number
): Date {
  const local = toLocalDate(d, tzOffsetMinutes);
  const nextLocalMidnight = new Date(
    Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() + 1,
      0,
      0,
      0
    )
  );
  return toUtcFromLocal(nextLocalMidnight, tzOffsetMinutes);
}
