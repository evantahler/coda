import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import { Config } from "../classes/config";
import { Logger } from "../classes/logger";
import { execute } from "./runCommand";

describe("runCommand", () => {
  const testDir = path.join(process.cwd(), "test-commands");
  const codaDir = path.join(testDir, ".coda");
  let config: Config;
  let logger: Logger;

  beforeAll(() => {
    // Create test directory and .coda subdirectory
    fs.mkdirSync(codaDir, { recursive: true });
    const commandsContent = `# COMMANDS

## 1. Echo Test
** Date Added: 2024-03-20 **
** Category: Test **
> Command: \`echo Hello, World!\`
> Description: A simple echo command for testing
> Usage: Used in tests
> Example: echo Hello, World!

## 2. Failing Command
** Date Added: 2024-03-20 **
** Category: Test **
> Command: \`exit 1\`
> Description: A command that always fails
> Usage: Used in tests
> Example: exit 1
`;
    fs.writeFileSync(path.join(codaDir, "commands.md"), commandsContent);
    config = new Config({ directory: testDir });
    logger = new Logger(config);
  });

  afterAll(() => {
    // Clean up test directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("should successfully run a valid command", async () => {
    const result = await execute(
      {
        projectPath: testDir,
        commandIdentifier: "echo",
      },
      config,
    );
    expect(result.trim()).toBe("Hello, World!");
  });

  it("should throw an error for a failing command", async () => {
    expect(
      execute(
        {
          projectPath: testDir,
          commandIdentifier: "exit",
        },
        config,
      ),
    ).rejects.toThrow("ShellError: Failed with exit code 1");
  });

  it("should throw an error for a non-existent command", async () => {
    expect(
      execute(
        {
          projectPath: testDir,
          commandIdentifier: "nonexistent",
        },
        config,
      ),
    ).rejects.toThrow('Command "nonexistent" not found in commands file');
  });

  it("should throw an error if commands file doesn't exist", async () => {
    const nonExistentDir = path.join(testDir, "nonexistent");
    expect(
      execute(
        {
          projectPath: nonExistentDir,
          commandIdentifier: "echo",
        },
        config,
      ),
    ).rejects.toThrow("Commands file not found");
  });
});
