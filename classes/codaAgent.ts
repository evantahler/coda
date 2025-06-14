import { Agent, type Tool, run, setDefaultOpenAIClient } from "@openai/agents";
import { EventEmitter } from "events";
import OpenAI from "openai";

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
  private readonly eventEmitter: EventEmitter;

  constructor(
    private readonly name: string,
    private readonly instructions: string,
    private readonly tools: Tool[] | undefined,
    private readonly apiKey: string,
    private readonly baseUrl: string | undefined,
    private readonly model: string | undefined,
  ) {
    // TODO: This likely isn't necessary every time we make a new agent
    const client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
    setDefaultOpenAIClient(client);

    this.agent = new Agent({
      name: this.name,
      model: this.model,
      instructions: this.instructions,
      tools: this.tools,
    });

    this.eventEmitter = new EventEmitter();
  }

  on<K extends CodaAgentEvent>(
    event: K,
    listener: (...args: CodaAgentEventMap[K]) => void,
  ): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  protected emit<K extends CodaAgentEvent>(
    event: K,
    ...args: CodaAgentEventMap[K]
  ): boolean {
    return this.eventEmitter.emit(event, ...args);
  }

  log(message: string): void {
    this.emit(CodaAgentEvent.LOG, message);
  }

  debug(message: string): void {
    this.emit(CodaAgentEvent.DEBUG, message);
  }

  error(error: Error): void {
    this.emit(CodaAgentEvent.ERROR, error);
  }

  protected async run(
    prompt: string,
    startingMessage?: string,
    endingMessage?: string,
  ) {
    if (startingMessage) {
      this.log(startingMessage);
    }

    const result = await run(this.agent, prompt);

    if (result.finalOutput) {
      this.debug(result.finalOutput);
    }

    if (endingMessage) {
      this.log(endingMessage);
    }

    return result;
  }
}
