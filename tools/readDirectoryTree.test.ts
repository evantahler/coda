import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import { execute } from "./readDirectoryTree";

describe("readDirectoryTreeTool", () => {
  const testDir = path.join("/tmp", `read-directory-tree-test-${Date.now()}`);
  const nestedDir = path.join(testDir, "nested");
  const deepDir = path.join(nestedDir, "deep");

  beforeAll(() => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.mkdirSync(deepDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, "file1.txt"), "test content");
    fs.writeFileSync(path.join(testDir, "file2.js"), "console.log('test')");
    fs.writeFileSync(path.join(nestedDir, "nested-file.txt"), "nested content");
    fs.writeFileSync(path.join(deepDir, "deep-file.txt"), "deep content");
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test("should list directory contents with hierarchy", async () => {
    const result = await execute({ path: testDir });
    const expectedOutput = `Directory tree for ${testDir}:
├── nested/
│   ├── deep/
│   │   └── deep-file.txt
│   └── nested-file.txt
├── file1.txt
└── file2.js
`;
    expect(result).toBe(expectedOutput);
  });

  test("should handle non-existent directory", async () => {
    const result = await execute({ path: "non-existent-dir" });
    expect(result).toBe("Error reading directory: No such file or directory");
  });

  test("should respect .gitignore patterns", async () => {
    // Create a .gitignore file that excludes .js files and the deep directory
    fs.writeFileSync(path.join(testDir, ".gitignore"), "*.js\ndeep/\n");

    const result = await execute({ path: testDir });
    const expectedOutput = `Directory tree for ${testDir}:
├── nested/
│   └── nested-file.txt
├── .gitignore
└── file1.txt
`;
    expect(result).toBe(expectedOutput);
  });
});
