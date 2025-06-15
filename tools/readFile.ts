import { tool } from "@openai/agents";
import * as fs from "fs";
import { z } from "zod";

import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { ToolUtils } from "../utils/toolUtils";

const name = "read_file";
const description = "Read the contents of a file";
const parametersSchema = z.object({ path: z.string() });

export const readFileTool = (config: Config, logger: Logger) =>
  tool({
    name,
    description,
    parameters: parametersSchema,
    execute: ToolUtils.wrappedExecute(name, execute, config, logger),
  });

export async function execute(parameters: z.infer<typeof parametersSchema>) {
  try {
    const content = fs.readFileSync(parameters.path, "utf8");
    return `File contents for ${parameters.path}:\n\n\`\`\`\n${content}\n\`\`\``;
  } catch (error: any) {
    return `Error reading file: ${error.message}`;
  }
}
