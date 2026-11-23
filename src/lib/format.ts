const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

// For example "Tue 1 Dec, 09:00–10:00"
export function formatTimeSlot(startsAt: Date, endsAt: Date) {
  return `${dateFormat.format(startsAt)}, ${timeFormat.format(startsAt)}–${timeFormat.format(endsAt)}`;
}
