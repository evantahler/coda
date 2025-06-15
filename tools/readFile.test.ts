import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import { execute } from "./readFile";

describe("readFileTool", () => {
  const testDir = path.join("/tmp", `read-file-test-${Date.now()}`);
  const testFile = path.join(testDir, "test.txt");
  const testContent = "Hello, World!";

  beforeAll(() => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(testFile, testContent);
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test("should read file contents successfully", async () => {
    const result = await execute({ path: testFile });
    const expectedOutput = `File contents for ${testFile}:\n\n\`\`\`\n${testContent}\n\`\`\``;
    expect(result).toBe(expectedOutput);
  });

  test("should handle non-existent file", async () => {
    const result = await execute({ path: "non-existent-file.txt" });
    expect(result.toLowerCase()).toContain("no such file or directory");
  });

  test("should handle directory path", async () => {
    const result = await execute({ path: testDir });
    expect(result).toBe("Error reading file: Is a directory");
  });
});
