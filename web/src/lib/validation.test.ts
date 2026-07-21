import { describe, it, expect } from "vitest";
import {
  isValidCNP,
  isValidCUI,
  isValidRole,
  isValidMessageBody,
  VALID_ROLES,
  type ValidRole,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// isValidCNP — Romanian CNP, exactly 13 digits (whitespace is trimmed).
// ---------------------------------------------------------------------------

describe("isValidCNP", () => {
  it("accepts a string of exactly 13 digits", () => {
    expect(isValidCNP("1234567890123")).toBe(true);
  });

  it("accepts a 13-digit string padded with surrounding whitespace (trims)", () => {
    expect(isValidCNP("  1234567890123  ")).toBe(true);
    expect(isValidCNP("\t1234567890123\n")).toBe(true);
  });

  it("rejects a 12-digit string (too short)", () => {
    expect(isValidCNP("123456789012")).toBe(false);
  });

  it("rejects a 14-digit string (too long)", () => {
    expect(isValidCNP("12345678901234")).toBe(false);
  });

  it("rejects a string containing non-digit characters", () => {
    expect(isValidCNP("abcdefghij1234")).toBe(false);
    expect(isValidCNP("123456789012a")).toBe(false);
    expect(isValidCNP("1234 567890123")).toBe(false); // internal space survives trim
  });

  it("rejects an empty string", () => {
    expect(isValidCNP("")).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    expect(isValidCNP("   ")).toBe(false);
    expect(isValidCNP("\t\n")).toBe(false);
  });

  it("rejects a 13-char string that mixes digits and letters", () => {
    // 13 characters total but not all digits.
    expect(isValidCNP("123456789012x")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidCUI — optional "RO" prefix (case-insensitive) + 2–10 digits.
// ---------------------------------------------------------------------------

describe("isValidCUI", () => {
  it("accepts RO prefix + digits", () => {
    expect(isValidCUI("RO12345678")).toBe(true);
  });

  it("accepts digits without the RO prefix", () => {
    expect(isValidCUI("12345678")).toBe(true);
  });

  it("accepts the 2-digit minimum (with and without RO)", () => {
    expect(isValidCUI("12")).toBe(true);
    expect(isValidCUI("RO12")).toBe(true);
  });

  it("accepts the 10-digit maximum (with and without RO)", () => {
    expect(isValidCUI("1234567890")).toBe(true);
    expect(isValidCUI("RO1234567890")).toBe(true);
  });

  it("rejects a single digit (below the 2-digit minimum)", () => {
    expect(isValidCUI("1")).toBe(false);
    expect(isValidCUI("RO1")).toBe(false); // RO + 1 digit = only 1 digit
  });

  it("rejects 11 digits (above the 10-digit maximum)", () => {
    expect(isValidCUI("12345678901")).toBe(false);
    expect(isValidCUI("RO12345678901")).toBe(false);
  });

  it("rejects non-digit characters after the optional RO prefix", () => {
    expect(isValidCUI("ROabc")).toBe(false);
    expect(isValidCUI("RO12ab34")).toBe(false);
    expect(isValidCUI("12ab34")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidCUI("")).toBe(false);
  });

  it("rejects a bare RO prefix with no digits", () => {
    expect(isValidCUI("RO")).toBe(false);
  });

  it("is case-insensitive on the RO prefix", () => {
    expect(isValidCUI("ro12345")).toBe(true);
    expect(isValidCUI("Ro12345")).toBe(true);
    expect(isValidCUI("rO12345")).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidCUI("  RO12345  ")).toBe(true);
    expect(isValidCUI("\t12345\n")).toBe(true);
  });

  it("rejects whitespace-only input", () => {
    expect(isValidCUI("   ")).toBe(false);
  });

  it("rejects a trailing/leading RO that is not at the start", () => {
    expect(isValidCUI("1234RO")).toBe(false);
    expect(isValidCUI("RO12RO34")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidRole — exact membership in VALID_ROLES (case-sensitive, no trim).
// ---------------------------------------------------------------------------

describe("isValidRole", () => {
  it.each(VALID_ROLES)("accepts the valid role %s", (role) => {
    expect(isValidRole(role)).toBe(true);
  });

  it("rejects a role that is not in the set", () => {
    expect(isValidRole("CHEF")).toBe(false);
    expect(isValidRole("MANAGER")).toBe(false);
    expect(isValidRole("COOK")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidRole("")).toBe(false);
  });

  it("rejects lowercase variants (exact, case-sensitive match)", () => {
    expect(isValidRole("barista")).toBe(false);
    expect(isValidRole("waiter")).toBe(false);
    expect(isValidRole("dishwasher")).toBe(false);
    expect(isValidRole("stagehand")).toBe(false);
  });

  it("rejects mixed-case variants", () => {
    expect(isValidRole("Barista")).toBe(false);
    expect(isValidRole("BarISTA")).toBe(false);
  });

  it("does not trim whitespace (exact match only)", () => {
    expect(isValidRole(" BARISTA")).toBe(false);
    expect(isValidRole("BARISTA ")).toBe(false);
    expect(isValidRole("BARISTA ")).toBe(false);
  });

  it("narrows the type to ValidRole inside the truthy branch", () => {
    const input: string = "BARISTA";
    if (isValidRole(input)) {
      // `input` is narrowed to ValidRole here; assign to a typed const to prove it.
      const narrowed: ValidRole = input;
      expect(VALID_ROLES).toContain(narrowed);
    } else {
      throw new Error("expected BARISTA to be a valid role");
    }
  });

  it("does not narrow for an invalid role", () => {
    const input: string = "CHEF";
    const wasValid = isValidRole(input);
    expect(wasValid).toBe(false);
  });

  it("exposes VALID_ROLES with the four expected entries in order", () => {
    expect(VALID_ROLES).toEqual([
      "BARISTA",
      "WAITER",
      "DISHWASHER",
      "STAGEHAND",
    ]);
  });
});

// ---------------------------------------------------------------------------
// isValidMessageBody — non-empty after trim, trimmed length <= max.
// ---------------------------------------------------------------------------

describe("isValidMessageBody", () => {
  it("accepts a normal non-empty message", () => {
    expect(isValidMessageBody("hello")).toBe(true);
    expect(isValidMessageBody("Salut, sunt disponibil mâine la 8")).toBe(true);
  });

  it("accepts a string that is only non-empty after trimming", () => {
    expect(isValidMessageBody("  hi  ")).toBe(true);
    expect(isValidMessageBody("\tmesaj\n")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidMessageBody("")).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    expect(isValidMessageBody("   ")).toBe(false);
    expect(isValidMessageBody("\t\t\n  \n")).toBe(false);
  });

  it("accepts a message whose trimmed length is exactly the default max (2000)", () => {
    const body = "a".repeat(2000);
    expect(isValidMessageBody(body)).toBe(true);
  });

  it("rejects a message whose trimmed length is 2001 (default max)", () => {
    const body = "a".repeat(2001);
    expect(isValidMessageBody(body)).toBe(false);
  });

  it("accepts a 2002-char string that trims down to exactly 2000", () => {
    const body = " " + "a".repeat(2000) + " ";
    expect(body.length).toBe(2002);
    expect(isValidMessageBody(body)).toBe(true);
  });

  it("rejects a string whose trimmed length exceeds the default max even with padding", () => {
    const body = " " + "a".repeat(2001) + " ";
    expect(isValidMessageBody(body)).toBe(false);
  });

  it("respects a custom max length (boundary inclusive)", () => {
    expect(isValidMessageBody("1234567890", 10)).toBe(true); // exactly 10
    expect(isValidMessageBody("12345678901", 10)).toBe(false); // 11 > 10
  });

  it("respects a custom max length of 1", () => {
    expect(isValidMessageBody("a", 1)).toBe(true);
    expect(isValidMessageBody("ab", 1)).toBe(false);
  });

  it("uses trimmed length against the custom max", () => {
    // "  hi  " trims to "hi" (length 2) which is <= 10.
    expect(isValidMessageBody("  hi  ", 10)).toBe(true);
    // 11 chars, no whitespace, max 10 -> too long.
    expect(isValidMessageBody("12345678901", 10)).toBe(false);
    // 12 chars with surrounding whitespace that trims to 10 -> ok.
    expect(isValidMessageBody("  1234567890  ", 10)).toBe(true);
  });

  it("rejects every non-empty input when max is 0", () => {
    expect(isValidMessageBody("a", 0)).toBe(false);
    expect(isValidMessageBody("hello", 0)).toBe(false);
    expect(isValidMessageBody("", 0)).toBe(false);
    expect(isValidMessageBody("   ", 0)).toBe(false);
  });

  it("rejects every input when max is negative", () => {
    expect(isValidMessageBody("a", -1)).toBe(false);
    expect(isValidMessageBody("", -1)).toBe(false);
  });

  it("defensively treats null/undefined input as empty (rejects)", () => {
    expect(isValidMessageBody(null as unknown as string)).toBe(false);
    expect(isValidMessageBody(undefined as unknown as string)).toBe(false);
  });

  it("uses 2000 as the default max when omitted", () => {
    // Sanity: 2000 passes, 2001 fails, confirming the default.
    expect(isValidMessageBody("a".repeat(2000))).toBe(true);
    expect(isValidMessageBody("a".repeat(2001))).toBe(false);
  });
});
