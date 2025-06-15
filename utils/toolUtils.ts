import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";

export class ToolUtils {
  static ensureCodaDir(projectPath: string) {
    const codaDir = path.join(projectPath, ".coda");
    if (!fs.existsSync(codaDir)) fs.mkdirSync(codaDir, { recursive: true });
    return codaDir;
  }

  static getCodaProjectOverviewPath(projectPath: string) {
    const codaDir = ToolUtils.ensureCodaDir(projectPath);
    return path.join(codaDir, "project-overview.md");
  }

  static getCodaMemoryPath(projectPath: string) {
    const codaDir = ToolUtils.ensureCodaDir(projectPath);
    return path.join(codaDir, "memory.md");
  }

  static wrappedExecute<T extends z.ZodType, R>(
    name: string,
    execute: (parameters: z.infer<T>, config: Config) => Promise<R>,
    config: Config,
    logger: Logger,
  ) {
    return async (parameters: z.infer<T>): Promise<R> => {
      const parmData: Record<string, string> = {};
      for (const [key, value] of Object.entries(parameters)) {
        const stringVal = `${value}`;
        if (stringVal.length > 0) {
          parmData[key] = stringVal.length > 50 ? "..." : stringVal;
        }
      }

      logger.updateSpan(
        `executing tool \`${name}\` ${config.log_color ? chalk.gray(`(${JSON.stringify(parmData)})`) : `(${JSON.stringify(parmData)})`}`,
        "⏳",
      );
      const startTime = Date.now();

      try {
        const result = await execute(parameters, config);
        const duration = Date.now() - startTime;
        logger.updateSpan(
          `completed execution of tool \`${name}\` in ${duration}ms`,
          "✔️",
        );
        logger.debug(`result: ${result}`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Failed execution after ${duration}ms: ${error}`);
        throw error;
      }
    };
  }
}
