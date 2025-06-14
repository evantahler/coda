import chalk from "chalk";

import { CodaAgent, CodaAgentEvent } from "./codaAgent";

export class AgentLogger {
  private includeTimestamps: boolean;
  private startTime: Date;

  constructor(
    private readonly agent: CodaAgent,
    includeTimestamps = true,
  ) {
    this.startTime = new Date();
    this.includeTimestamps = includeTimestamps;

    this.agent.on(CodaAgentEvent.LOG, (message) => this.log(message));
    this.agent.on(CodaAgentEvent.ERROR, (error) => this.error(error));
    this.agent.on(CodaAgentEvent.DEBUG, (message) => this.debug(message));
  }

  end() {
    const timestamp = this.getTimestamp();
    const duration = new Date().getTime() - this.startTime.getTime();
    console.log(
      `${timestamp} ${chalk.green("👋")} ${chalk.gray(
        `Completed in ${duration}ms`,
      )}`,
    );
  }

  private getTimestamp() {
    return this.includeTimestamps
      ? chalk.gray(
          `[${new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}]`,
        )
      : "";
  }

  log(message: string) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} ${chalk.white(message)}`);
  }

  error(error: Error) {
    const timestamp = this.getTimestamp();
    console.error(`${timestamp} ${chalk.red(error)}`);
  }

  debug(message: string) {
    const timestamp = this.getTimestamp();
    console.debug(`${timestamp} ${chalk.gray(message)}`);
  }
}
