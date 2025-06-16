import { handoff } from "@openai/agents";

import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { ToolUtils } from "../utils/toolUtils";
import { AnalyzeAgent } from "./analyze";
import { CommandsAgent } from "./commands";
import { MemoryAgent } from "./memory";

export class CodingAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const codaProjectOverviewPath = ToolUtils.getCodaProjectOverviewPath(
      config.directory,
    );
    const instructions = `
You are a coding assistant.

This project is described in the project overview file: \`${codaProjectOverviewPath}\`.
If you can answer a question based on the content of this file, that's the best way to do it.

You can delegate your work to other agents:
- MemoryAgent: for managing the memory of the project
- AnalyzeAgent: for analyzing and describing the project
- CommandsAgent: for managing the commands of the project (including running commands)

Prefer to delegate work to other agents rather than doing it yourself when possible.
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

    const result = await this.run(message);

    this.logger.endSpan(result.finalOutput);
    return result;
  }
}
