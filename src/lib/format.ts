import { TIME_ZONE } from "./time-zone";

// Times are always shown in the business's time zone, not the server's
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

// For example "Tue 1 Dec, 09:00–10:00"
export function formatTimeSlot(startsAt: Date, endsAt: Date) {
  return `${dateFormat.format(startsAt)}, ${timeFormat.format(startsAt)}–${timeFormat.format(endsAt)}`;
}
