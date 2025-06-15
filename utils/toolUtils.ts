import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

import type { Logger } from "../classes/logger";

export class ToolUtils {
  static ensureCodaDir(searchPath: string) {
    const codaDir = path.join(searchPath, ".coda");
    if (!fs.existsSync(codaDir)) fs.mkdirSync(codaDir, { recursive: true });
    return codaDir;
  }

  static getCodaProjectOverviewPath(searchPath: string) {
    const codaDir = ToolUtils.ensureCodaDir(searchPath);
    return path.join(codaDir, "project-overview.md");
  }

  static wrappedExecute<T extends z.ZodType, R>(
    name: string,
    execute: (parameters: z.infer<T>) => Promise<R>,
    logger: Logger,
  ) {
    return async (parameters: z.infer<T>): Promise<R> => {
      logger.updateSpan(
        `executing tool \`${name}\` (${JSON.stringify(parameters)})`,
        "🔧",
      );
      const startTime = Date.now();

      try {
        const result = await execute(parameters);
        const duration = Date.now() - startTime;
        logger.updateSpan(
          `completed execution of tool \`${name}\` in ${duration}s`,
          "🛠️",
        );
        logger.debug(`result: ${result}`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Failed execution after ${duration}s: ${error}`);
        throw error;
      }
    };
  }
}
