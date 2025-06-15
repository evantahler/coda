import { handoff } from "@openai/agents";

import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { AnalyzeAgent } from "./analyze";
import { CommandsAgent } from "./commands";
import { MemoryAgent } from "./memory";

export class CodingAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const instructions = `
You are a coding assistant.

You can delegate your work to other agents.

When starting up, you should load all the context you can about the project from the Memory Agent.
    `;

    const handoffs = [
      handoff(new MemoryAgent(config, logger).agent),
      handoff(new AnalyzeAgent(config, logger).agent),
      handoff(new CommandsAgent(config, logger).agent),
    ];

    super("CodingAgent", instructions, [], handoffs, config, logger);
  }

  async code(projectPath: string) {
    this.logger.startSpan(`Coding project at ${projectPath}...`);

    const result = await this.run(`...`);

    this.logger.endSpan(result.finalOutput);
  }
}
