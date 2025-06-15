import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import { Config } from "../classes/config";
import { execute } from "./writeFile";

describe("writeFileTool", () => {
  const testDir = path.join(process.cwd(), "test-temp");
  const testFile = path.join(testDir, "test.txt");

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
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("should write file successfully", async () => {
    const content = "Hello, World!";
    const config = new Config({
      directory: testDir,
    });
    const result = await execute(
      {
        path: testFile,
        content,
      },
      config,
    );
    expect(result).toBe(`File written successfully to ${testFile}`);
    expect(fs.existsSync(testFile)).toBe(true);
    expect(fs.readFileSync(testFile, "utf-8")).toBe(content);
  });

  test("should handle non-existent directory", async () => {
    const nonExistentPath = path.join(process.cwd(), "nonexistent", "test.txt");
    const config = new Config({
      directory: testDir,
    });
    const result = await execute(
      {
        path: nonExistentPath,
        content: "test",
      },
      config,
    );
    expect(result).toContain("Error writing file");
  });

  test("should handle permission errors", async () => {
    // Create a read-only directory
    const readOnlyDir = path.join(testDir, "readonly");
    fs.mkdirSync(readOnlyDir, { mode: 0o444 });

    const config = new Config({
      directory: testDir,
    });
    const result = await execute(
      {
        path: path.join(readOnlyDir, "test.txt"),
        content: "test",
      },
      config,
    );

    expect(result).toContain("Error writing file");

    // Clean up
    fs.rmdirSync(readOnlyDir);
  });

  test("should prevent writing files outside configured directory", async () => {
    const config = new Config({
      directory: testDir,
    });

    // Attempt to write a file outside the configured directory using path traversal
    const outsidePath = path.join(process.cwd(), "outside.txt");
    const result = await execute(
      {
        path: outsidePath,
        content: "This should not be written",
      },
      config,
    );

    // Should return a generic error message
    expect(result.toLowerCase()).toContain("error writing file");
    expect(fs.existsSync(outsidePath)).toBe(false);

    // Clean up in case the test fails
    if (fs.existsSync(outsidePath)) {
      fs.unlinkSync(outsidePath);
    }
  });
});
