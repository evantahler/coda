import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import { Config } from "../classes/config";
import { LogLevel, Logger } from "../classes/logger";
import { execute } from "./writeFile";

describe("writeFileTool", () => {
  const testDir = path.join(process.cwd(), "test-temp");
  const testFile = path.join(testDir, "test.txt");
  const logger = new Logger(
    new Config({
      openai_api_key: "test-key",
      log_level: LogLevel.DEBUG,
    }),
  );

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  });

  test("should write file successfully", async () => {
    const content = "Hello, World!";
    const result = await execute({ path: testFile, content });
    expect(result).toBe(`File written successfully to ${testFile}`);
    expect(fs.existsSync(testFile)).toBe(true);
    expect(fs.readFileSync(testFile, "utf-8")).toBe(content);
  });

  test("should handle non-existent directory", async () => {
    const nonExistentPath = path.join(testDir, "nonexistent", "test.txt");
    const result = await execute({ path: nonExistentPath, content: "test" });
    expect(result).toContain("Error writing file");
  });

  test("should handle permission errors", async () => {
    // Create a read-only directory
    const readOnlyDir = path.join(testDir, "readonly");
    fs.mkdirSync(readOnlyDir, { mode: 0o444 });

    const result = await execute({
      path: path.join(readOnlyDir, "test.txt"),
      content: "test",
    });

    expect(result).toContain("Error writing file");

    // Clean up
    fs.rmdirSync(readOnlyDir);
  });
});
