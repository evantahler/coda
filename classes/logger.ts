import chalk from "chalk";
import ora, { type Ora } from "ora";

import type { Config } from "./config";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export class Logger {
  private level: LogLevel;
  private color: boolean;
  private includeTimestamps: boolean;
  private spanStartTime: number | undefined = undefined;
  private spinner: Ora | undefined = undefined;

  constructor(config: Config) {
    this.includeTimestamps = config.log_timestamps;
    this.level = config.log_level;
    this.color = config.log_color;
  }

  private getTimestamp() {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return this.includeTimestamps
      ? this.color
        ? chalk.gray(`[${timestamp}]`)
        : `[${timestamp}]`
      : "";
  }

  private getSpanMarker() {
    return this.spanStartTime !== undefined ? " ├─" : "";
  }

  info(message: string) {
    if (this.level === LogLevel.ERROR || this.level === LogLevel.WARN) return;

    const timestamp = this.getTimestamp();
    const spanMarker = this.getSpanMarker();
    console.log(
      `${timestamp}${spanMarker} ${this.color ? chalk.white(message) : message}`,
    );
  }

  warn(message: string) {
    if (this.level === LogLevel.ERROR) return;

    const timestamp = this.getTimestamp();
    const spanMarker = this.getSpanMarker();
    console.error(
      `${timestamp}${spanMarker} ${this.color ? chalk.yellow(message) : message}`,
    );
  }

  error(message: string) {
    const timestamp = this.getTimestamp();
    const spanMarker = this.getSpanMarker();
    console.error(
      `${timestamp}${spanMarker} ${this.color ? chalk.red(message) : message}`,
    );
  }

  debug(message: string) {
    if (this.level !== LogLevel.DEBUG) return;

    const timestamp = this.getTimestamp();
    const spanMarker = this.getSpanMarker();
    console.debug(
      `${timestamp}${spanMarker} ${this.color ? chalk.gray(message) : message}`,
    );
  }

  startSpan(message: string) {
    this.info(message);
    this.spanStartTime = Date.now();
    this.spinner = ora(`${this.color ? chalk.cyan(message) : message}`).start();
  }

  updateSpan(message: string, emoji: string) {
    if (!this.spinner) return;

    const currentMessage = this.spinner.text;
    const timestamp = this.getTimestamp();
    const spanMarker = this.getSpanMarker();

    this.spinner.stopAndPersist({
      text: `${this.color ? chalk.white(message) : message}`,
      symbol: `${timestamp}${spanMarker} ${emoji}`,
    });

    this.spinner.start(currentMessage);
  }

  endSpan(message: string = "Completed with no output") {
    const timestamp = this.getTimestamp();
    const duration = Math.round(
      (Date.now() - (this.spanStartTime ?? Date.now())) / 1000,
    );
    this.spinner?.succeed(
      `${timestamp} ${this.color ? chalk.cyan(message) : message} (${duration}s)`,
    );

    this.spinner = undefined;
    this.spanStartTime = undefined;
  }
}
