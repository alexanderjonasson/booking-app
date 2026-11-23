import { describe, expect, it } from "vitest";
import { formatTimeSlot } from "./format";

describe("formatTimeSlot", () => {
  it("shows the day, date and both times", () => {
    const text = formatTimeSlot(
      new Date("2026-12-01T09:00"),
      new Date("2026-12-01T10:30"),
    );

    expect(text).toBe("Tue 1 Dec, 09:00–10:30");
  });
});
