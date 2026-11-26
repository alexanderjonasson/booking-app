// All times in the app are in the business's time zone, wherever the server
// runs. Servers in the cloud usually run in UTC, so this can't be left to them.
export const TIME_ZONE = "Europe/Stockholm";

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

// How far ahead of UTC the time zone is at a given moment, in milliseconds.
// For Stockholm that is 1 hour in winter and 2 hours in summer.
function offsetAt(moment: Date) {
  const parts = Object.fromEntries(
    partsFormat.formatToParts(moment).map((part) => [part.type, part.value]),
  );
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asIfUtc - moment.getTime();
}

// Turns a date ("2026-12-01") and a time ("09:00") in Stockholm into the
// exact moment, which is what the database stores.
export function stockholmTimeToDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // Start by treating the time as UTC, then move it by the offset.
  // The offset is checked again at the result, in case the guess and the
  // result fall on different sides of a daylight saving change.
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  const firstGuess = asIfUtc - offsetAt(new Date(asIfUtc));
  return new Date(asIfUtc - offsetAt(new Date(firstGuess)));
}
