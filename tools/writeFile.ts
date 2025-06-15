import { tool } from "@openai/agents";
import * as fs from "fs";
import { z } from "zod";

import type { Logger } from "../classes/logger";
import { ToolUtils } from "../utils/toolUtils";

const name = "write_file";
const description = "Write the contents of a file";
const parametersSchema = z.object({ path: z.string(), content: z.string() });

export const writeFileTool = (logger: Logger) =>
  tool({
    name,
    description,
    parameters: parametersSchema,
    execute: ToolUtils.wrappedExecute(name, execute, logger),
  });

export async function execute(parameters: z.infer<typeof parametersSchema>) {
  try {
    fs.writeFileSync(parameters.path, parameters.content);
    return `File written successfully to ${parameters.path}`;
  } catch (error: any) {
    return `Error writing file: ${error.message}`;
  }
}
