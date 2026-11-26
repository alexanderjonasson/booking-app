import { describe, expect, it } from "vitest";
import { formatTimeSlot } from "./format";

describe("formatTimeSlot", () => {
  it("shows the day, date and both times in Stockholm time", () => {
    // 08:00 UTC is 09:00 in Stockholm in winter
    const text = formatTimeSlot(
      new Date("2026-12-01T08:00:00Z"),
      new Date("2026-12-01T09:30:00Z"),
    );

    expect(text).toBe("Tue 1 Dec, 09:00–10:30");
  });
});
