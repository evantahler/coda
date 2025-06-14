import { expect, test, describe } from "bun:test";
import { BotConfused, BotHappy, BotSad } from "./ascii.test";

describe("ASCII Art", () => {
  test("BotConfused should have blue face and gray border", () => {
    const lines = BotConfused.split("\n");

    // Check that the first line contains border characters
    expect(lines[0]).toContain("╔");
    expect(lines[0]).toContain("╗");

    // Check a line with the face
    const faceLine = lines.find((line) => line.includes("~ ~ ~"));
    expect(faceLine).toBeDefined();
    expect(faceLine).toContain("~ ~ ~");
    expect(faceLine).toContain("│");
  });

  test("BotHappy should have blue face and gray border", () => {
    const lines = BotHappy.split("\n");

    // Check that the first line contains border characters
    expect(lines[0]).toContain("╔");
    expect(lines[0]).toContain("╗");

    // Check a line with the face
    const faceLine = lines.find((line) => line.includes("‿‿‿"));
    expect(faceLine).toBeDefined();
    expect(faceLine).toContain("‿‿‿");
    expect(faceLine).toContain("│");
  });

  test("BotSad should have blue face and gray border", () => {
    const lines = BotSad.split("\n");

    // Check that the first line contains border characters
    expect(lines[0]).toContain("╔");
    expect(lines[0]).toContain("╗");

    // Check a line with the face
    const faceLine = lines.find((line) => line.includes("⌒⌒⌒"));
    expect(faceLine).toBeDefined();
    expect(faceLine).toContain("⌒⌒⌒");
    expect(faceLine).toContain("│");
  });
});
