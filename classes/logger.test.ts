import { describe, expect, spyOn, test } from "bun:test";

import { Config } from "./config";
import { LogLevel, Logger } from "./logger";

describe("Logger", () => {
  const mockConfig = new Config({
    openai_api_key: "test-key",
    log_timestamps: false,
    log_level: LogLevel.DEBUG,
    log_color: false,
  });

  test("should create logger instance", () => {
    const logger = new Logger(mockConfig);
    expect(logger).toBeDefined();
  });

  test("should not log debug messages when level is ERROR", () => {
    const config = new Config({
      openai_api_key: "test-key",
      log_level: LogLevel.ERROR,
      log_timestamps: false,
      log_color: false,
    });
    const logger = new Logger(config);
    const consoleSpy = spyOn(console, "debug");
    logger.debug("test message");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test("should log error messages regardless of level", () => {
    const config = new Config({
      openai_api_key: "test-key",
      log_level: LogLevel.ERROR,
      log_timestamps: false,
      log_color: false,
    });
    const logger = new Logger(config);
    const consoleSpy = spyOn(console, "error");
    logger.error("test message");
    expect(consoleSpy).toHaveBeenCalled();
  });
});
