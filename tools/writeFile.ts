import { tool } from "@openai/agents";
import { $ } from "bun";
import path from "path";
import { z } from "zod";

import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { ToolUtils } from "../utils/toolUtils";

const name = "write_file";
const description = "Write the contents of a file";
const parametersSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const writeFileTool = (config: Config, logger: Logger) =>
  tool({
    name,
    description,
    parameters: parametersSchema,
    execute: ToolUtils.wrappedExecute(name, execute, config, logger),
  });

export async function execute(
  parameters: z.infer<typeof parametersSchema>,
  config: Config,
) {
  try {
    // Resolve the target path relative to the configured directory
    const targetPath = path.resolve(parameters.path);
    const configDir = path.resolve(config.directory);

    // Check if the target path is outside the configured directory
    if (!targetPath.startsWith(configDir)) {
      return `Error writing file: Cannot write outside configured directory ${configDir}`;
    }

    const relativePath = path.relative(configDir, targetPath);

    // Ideally we would use chroots here, but that doesn't work on Windows or Mac...
    // so we can use the much heaver docker with a volume mount to protect the host machine except the directory in question
    const response =
      await $`docker run --rm -v ${configDir}:/mount alpine:latest sh -c "printf '%s' '${parameters.content}' > /mount/${relativePath}"`.text();

    return `File written successfully to ${parameters.path}${
      response.length > 0 ? ` with response: ${response}` : ""
    }`;
  } catch (error: any) {
    return `Error writing file: ${error.message}`;
  }
}
