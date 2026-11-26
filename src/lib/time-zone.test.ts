import { describe, expect, it } from "vitest";
import { stockholmTimeToDate } from "./time-zone";

// The expected values are written in UTC (the "Z" at the end),
// so the tests give the same result on any computer or server.
describe("stockholmTimeToDate", () => {
  it("is one hour ahead of UTC in winter", () => {
    expect(stockholmTimeToDate("2026-12-01", "09:00")).toEqual(
      new Date("2026-12-01T08:00:00Z"),
    );
  });

  it("is two hours ahead of UTC in summer", () => {
    expect(stockholmTimeToDate("2026-07-01", "09:00")).toEqual(
      new Date("2026-07-01T07:00:00Z"),
    );
  });

  it("handles the morning after the clocks go forward", () => {
    // Summer time starts at 02:00 on 29 March 2026
    expect(stockholmTimeToDate("2026-03-29", "09:00")).toEqual(
      new Date("2026-03-29T07:00:00Z"),
    );
  });

  it("handles the morning after the clocks go back", () => {
    // Summer time ends at 03:00 on 25 October 2026
    expect(stockholmTimeToDate("2026-10-25", "09:00")).toEqual(
      new Date("2026-10-25T08:00:00Z"),
    );
  });

  it("handles midnight", () => {
    expect(stockholmTimeToDate("2026-12-01", "00:00")).toEqual(
      new Date("2026-11-30T23:00:00Z"),
    );
  });
});
