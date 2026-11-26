import { describe, expect, it } from "vitest";
import { calculateEnd, parseTimeSlot } from "./time-slots";

// A fixed "now" (12:00 in Stockholm), so the tests give the same result every day
const now = new Date("2026-11-23T11:00:00Z");

describe("parseTimeSlot", () => {
  it("turns valid form values into a service id and a start date", () => {
    const result = parseTimeSlot(
      { serviceId: "3", date: "2026-12-01", startTime: "09:00" },
      now,
    );

    expect(result).toEqual({
      success: true,
      // 09:00 in Stockholm is 08:00 UTC in winter
      data: { serviceId: 3, startsAt: new Date("2026-12-01T08:00:00Z") },
    });
  });

  it("asks for a service when none is picked", () => {
    const result = parseTimeSlot(
      { serviceId: "", date: "2026-12-01", startTime: "09:00" },
      now,
    );

    expect(result).toEqual({ success: false, error: "Pick a service" });
  });

  it("asks for a date when it is missing", () => {
    const result = parseTimeSlot(
      { serviceId: "3", date: "", startTime: "09:00" },
      now,
    );

    expect(result).toEqual({ success: false, error: "Pick a date" });
  });

  it("rejects a start time that is not a real time", () => {
    const result = parseTimeSlot(
      { serviceId: "3", date: "2026-12-01", startTime: "25:00" },
      now,
    );

    expect(result).toEqual({ success: false, error: "Pick a start time" });
  });

  it("rejects a time in the past", () => {
    const result = parseTimeSlot(
      { serviceId: "3", date: "2026-11-23", startTime: "08:00" },
      now,
    );

    expect(result).toEqual({
      success: false,
      error: "The time must be in the future",
    });
  });

  it("accepts a time later the same day", () => {
    const result = parseTimeSlot(
      { serviceId: "3", date: "2026-11-23", startTime: "13:00" },
      now,
    );

    expect(result.success).toBe(true);
  });
});

describe("calculateEnd", () => {
  it("adds the length of the service to the start", () => {
    expect(calculateEnd(new Date("2026-12-01T08:00:00Z"), 45)).toEqual(
      new Date("2026-12-01T08:45:00Z"),
    );
  });

  it("can end after midnight", () => {
    expect(calculateEnd(new Date("2026-12-01T23:30:00Z"), 60)).toEqual(
      new Date("2026-12-02T00:30:00Z"),
    );
  });
});
