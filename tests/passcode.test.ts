import { describe, expect, it } from "vitest";
import { decodePass, encodePass, lessonForCode, passCodeFor } from "@/lib/passcode";
import { ALL_LESSONS } from "@/content/curriculum";

describe("pass codes", () => {
  it("round-trips every lesson", () => {
    for (const l of ALL_LESSONS) expect(lessonForCode(passCodeFor(l))?.id).toBe(l.id);
  });

  it("accepts sloppy typing", () => {
    const code = encodePass(1, 2);
    expect(decodePass(code.toLowerCase().replace(/-/g, " "))).toEqual({ step: 1, lesson: 2 });
  });

  it("rejects a wrong checksum or garbage", () => {
    const code = encodePass(1, 2);
    const bad = code.slice(0, -1) + (code.endsWith("A") ? "B" : "A");
    expect(decodePass(bad)).toBeNull();
    expect(decodePass("hello")).toBeNull();
    expect(lessonForCode(encodePass(1, 99))).toBeNull();
  });

  it("gives different lessons different codes", () => {
    const codes = ALL_LESSONS.map(passCodeFor);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
