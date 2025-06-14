import { z } from "zod";

export class ToolUtils {
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
