
export const CHALLENGE_TIME_ZONE = "Africa/Lagos";

export function getOasysDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CHALLENGE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type) =>
    parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDaysToKey(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day + days)
  );

  return date.toISOString().slice(0, 10);
}

export function getScheduleDates(count = 8) {
  const today = getOasysDateKey();

  return Array.from({ length: count }, (_, index) =>
    addDaysToKey(today, index)
  );
}

export function formatScheduleDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}