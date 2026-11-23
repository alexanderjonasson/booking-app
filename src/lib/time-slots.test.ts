import { describe, expect, it } from "vitest";
import { parseTimeSlot } from "./time-slots";

// A fixed "now", so the tests give the same result every day
const now = new Date("2026-11-23T12:00");

describe("parseTimeSlot", () => {
  it("turns a valid date and times into start and end dates", () => {
    const result = parseTimeSlot(
      { date: "2026-12-01", startTime: "09:00", endTime: "10:00" },
      now,
    );

    expect(result).toEqual({
      success: true,
      data: {
        startsAt: new Date("2026-12-01T09:00"),
        endsAt: new Date("2026-12-01T10:00"),
      },
    });
  });

  it("asks for a date when it is missing", () => {
    const result = parseTimeSlot(
      { date: "", startTime: "09:00", endTime: "10:00" },
      now,
    );

    expect(result).toEqual({ success: false, error: "Pick a date" });
  });

  it("rejects a start time that is not a real time", () => {
    const result = parseTimeSlot(
      { date: "2026-12-01", startTime: "25:00", endTime: "10:00" },
      now,
    );

    expect(result).toEqual({ success: false, error: "Pick a start time" });
  });

  it("rejects an end time before the start time", () => {
    const result = parseTimeSlot(
      { date: "2026-12-01", startTime: "11:00", endTime: "10:00" },
      now,
    );

    expect(result).toEqual({
      success: false,
      error: "The end time must be after the start time",
    });
  });

  it("rejects a time that ends when it starts", () => {
    const result = parseTimeSlot(
      { date: "2026-12-01", startTime: "10:00", endTime: "10:00" },
      now,
    );

    expect(result.success).toBe(false);
  });

  it("rejects a time in the past", () => {
    const result = parseTimeSlot(
      { date: "2026-11-23", startTime: "08:00", endTime: "09:00" },
      now,
    );

    expect(result).toEqual({
      success: false,
      error: "The time must be in the future",
    });
  });

  it("accepts a time later the same day", () => {
    const result = parseTimeSlot(
      { date: "2026-11-23", startTime: "13:00", endTime: "14:00" },
      now,
    );

    expect(result.success).toBe(true);
  });
});
