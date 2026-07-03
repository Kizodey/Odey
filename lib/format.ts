export function toDateParam(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function fromDateParam(param: string | undefined) {
  if (!param) return new Date();
  const d = new Date(`${param}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDay(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatRaceTime(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
