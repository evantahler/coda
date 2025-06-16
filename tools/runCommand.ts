import { tool } from "@openai/agents";
import * as fs from "fs";
import { z } from "zod";

import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { ToolUtils } from "../utils/toolUtils";

const name = "run_command";
const description =
  "Run a command that has been previously stored in the commands file";
const parametersSchema = z.object({
  projectPath: z.string(),
  commandIdentifier: z.string(),
});

export async function execute(
  parameters: z.infer<typeof parametersSchema>,
  config: Config,
): Promise<string> {
  const { projectPath, commandIdentifier } = parameters;
  const codaCommandsPath = ToolUtils.getCodaCommandsPath(projectPath);

  // First, verify the command exists in commands.md
  if (!fs.existsSync(codaCommandsPath)) {
    throw new Error(`Commands file not found at ${codaCommandsPath}`);
  }

  const commandsContent = fs.readFileSync(codaCommandsPath, "utf-8");
  const commandRegex = new RegExp(`Command: \`([^\`]+)\``, "g");
  const allowedCommands = new Set<string>();
  let match;

  while ((match = commandRegex.exec(commandsContent)) !== null) {
    allowedCommands.add(match[1]);
  }

  // Find the command that matches the identifier
  let commandToRun: string | undefined;
  for (const cmd of allowedCommands) {
    if (cmd.includes(commandIdentifier)) {
      commandToRun = cmd;
      break;
    }
  }

  if (!commandToRun) {
    throw new Error(
      `Command "${commandIdentifier}" not found in commands file. Only commands listed in ${codaCommandsPath} can be executed.`,
    );
  }

  try {
    const parts = commandToRun.split(" ");
    const { stdout, stderr, exitCode } = await Bun.$`${parts}`.quiet();
    if (exitCode !== 0) {
      throw new Error(
        `
Command failed with exit code ${exitCode}:
stdout: ${stdout}
stderr: ${stderr}
        `,
      );
    }
    return stdout.toString() + stderr.toString();
  } catch (error) {
    throw new Error(`Command failed: ${error}`);
  }
}

export const runCommandTool = (config: Config, logger: Logger) =>
  tool({
    name,
    description,
    parameters: parametersSchema,
    execute: ToolUtils.wrappedExecute(name, execute, config, logger),
  });
