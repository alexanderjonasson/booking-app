import { describe, expect, it } from "vitest";
import { formatDuration, parseService } from "./services";

describe("parseService", () => {
  it("turns valid form values into a service", () => {
    const result = parseService({
      name: "  Consultation  ",
      description: "  A first meeting to talk about your needs ",
      durationMinutes: "45",
    });

    expect(result).toEqual({
      success: true,
      data: {
        name: "Consultation",
        description: "A first meeting to talk about your needs",
        durationMinutes: 45,
      },
    });
  });

  it("saves an empty description as no description", () => {
    const result = parseService({
      name: "Consultation",
      description: "   ",
      durationMinutes: "30",
    });

    expect(result).toEqual({
      success: true,
      data: { name: "Consultation", description: null, durationMinutes: 30 },
    });
  });

  it("asks for a name when it is empty", () => {
    const result = parseService({
      name: "   ",
      description: "",
      durationMinutes: "30",
    });

    expect(result).toEqual({ success: false, error: "Give the service a name" });
  });

  it("rejects a name that is too long", () => {
    const result = parseService({
      name: "a".repeat(61),
      description: "",
      durationMinutes: "30",
    });

    expect(result).toEqual({
      success: false,
      error: "The name can be at most 60 characters",
    });
  });

  it("rejects a description that is too long", () => {
    const result = parseService({
      name: "Consultation",
      description: "a".repeat(201),
      durationMinutes: "30",
    });

    expect(result).toEqual({
      success: false,
      error: "The description can be at most 200 characters",
    });
  });

  it("only accepts lengths from the list", () => {
    for (const durationMinutes of ["", "0", "20", "abc"]) {
      const result = parseService({
        name: "Consultation",
        description: "",
        durationMinutes,
      });

      expect(result).toEqual({
        success: false,
        error: "Pick a length from the list",
      });
    }
  });
});

describe("formatDuration", () => {
  it("shows minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("shows whole hours", () => {
    expect(formatDuration(120)).toBe("2 h");
  });

  it("shows hours and minutes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min");
  });
});
