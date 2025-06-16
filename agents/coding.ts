import { handoff } from "@openai/agents";

import { CodaAgent, type Message } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { AnalyzeAgent } from "./analyze";
import { CommandsAgent } from "./commands";
import { MemoryAgent } from "./memory";

export class CodingAgent extends CodaAgent {
  private messageHistory: Message[] = [];

  constructor(config: Config, logger: Logger) {
    const instructions = `
You are a coding assistant.
You can delegate your work to other agents.
`;

    const tools = [readFileTool(config, logger), writeFileTool(config, logger)];

    const handoffs = [
      handoff(new MemoryAgent(config, logger).agent),
      handoff(new AnalyzeAgent(config, logger).agent),
      handoff(new CommandsAgent(config, logger).agent),
    ];

    super("CodingAgent", instructions, tools, handoffs, config, logger);
  }

  async code(message: string) {
    this.logger.startSpan("Thinking...");

    // Add user message to history
    this.messageHistory.push({ role: "user", content: message });

    // Run with message history
    const result = await this.run(message, this.messageHistory);

    // Add assistant response to history
    if (result.finalOutput) {
      this.messageHistory.push({
        role: "assistant",
        content: result.finalOutput,
      });
    }

    this.logger.endSpan(result.finalOutput);
    return result;
  }

  clearHistory() {
    this.messageHistory = [];
  }
}
