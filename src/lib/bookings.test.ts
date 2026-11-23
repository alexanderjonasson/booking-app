import { describe, expect, it } from "vitest";
import { maxNoteLength, parseBooking } from "./bookings";

describe("parseBooking", () => {
  it("turns the form values into a time id and a message", () => {
    expect(
      parseBooking({ timeSlotId: "7", note: "  I want to talk about my website " }),
    ).toEqual({
      success: true,
      data: { timeSlotId: 7, note: "I want to talk about my website" },
    });
  });

  it("saves an empty message as no message", () => {
    expect(parseBooking({ timeSlotId: "7", note: "   " })).toEqual({
      success: true,
      data: { timeSlotId: 7, note: null },
    });
  });

  it("accepts a message of exactly the max length", () => {
    const note = "a".repeat(maxNoteLength);

    expect(parseBooking({ timeSlotId: "7", note }).success).toBe(true);
  });

  it("rejects a message that is too long", () => {
    const note = "a".repeat(maxNoteLength + 1);

    expect(parseBooking({ timeSlotId: "7", note })).toEqual({
      success: false,
      error: "The message can be at most 500 characters",
    });
  });

  it("rejects a time id that is not a whole positive number", () => {
    for (const timeSlotId of ["", "abc", "1.5", "-3"]) {
      expect(parseBooking({ timeSlotId, note: "" })).toEqual({
        success: false,
        error: "Something went wrong, try again",
      });
    }
  });
});
