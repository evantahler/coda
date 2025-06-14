import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

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
  ) {
    return async (parameters: z.infer<T>): Promise<R> => {
      console.debug(
        `🛠️ executing tool \`${name}\` with parameters: ${JSON.stringify(
          parameters,
        )}`,
      );
      const startTime = performance.now();

      try {
        const result = await execute(parameters);
        const duration = performance.now() - startTime;
        console.debug(`🛠️ completed execution in ${duration.toFixed(2)}ms`);
        console.debug(`🛠️ result:`, result);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(
          `Failed execution after ${duration.toFixed(2)}ms:`,
          error,
        );
        throw error;
      }
    };
  }
}
