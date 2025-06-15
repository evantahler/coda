import { Agent, type Tool, run, setDefaultOpenAIClient } from "@openai/agents";
import OpenAI from "openai";

import { Config } from "./config";
import type { Logger } from "./logger";

export enum CodaAgentEvent {
  DEBUG = "debug",
  ERROR = "error",
  LOG = "log",
}

export type CodaAgentEventMap = {
  [CodaAgentEvent.DEBUG]: [message: string];
  [CodaAgentEvent.ERROR]: [error: Error];
  [CodaAgentEvent.LOG]: [message: string];
};

export abstract class CodaAgent {
  readonly agent: Agent;

  constructor(
    readonly name: string,
    readonly instructions: string,
    readonly tools: Tool[] | undefined,
    readonly config: Config,
    readonly logger: Logger,
  ) {
    // TODO: This likely isn't necessary every time we make a new agent
    const client = new OpenAI({
      apiKey: this.config.openai_api_key,
      baseURL: this.config.openai_base_url,
    });
    setDefaultOpenAIClient(client);

    this.agent = new Agent({
      name: this.name,
      model: this.config.openai_model,
      instructions: this.instructions,
      tools: this.tools,
    });
  }

  protected async run(prompt: string) {
    const result = await run(this.agent, prompt);

    if (result.finalOutput) {
      this.logger.debug(result.finalOutput);
    }

    return result;
  }
}
