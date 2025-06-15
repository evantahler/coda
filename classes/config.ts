import type { LogLevel } from "./logger";

export class Config {
  public readonly openai_api_key: string;
  public readonly openai_base_url: string | undefined;
  public readonly openai_model: string | undefined;
  public readonly directory: string;
  public readonly log_level: LogLevel;
  public readonly log_color: boolean = true;
  public readonly log_timestamps: boolean = true;

  constructor(options: Record<string, string | boolean | undefined>) {
    const openai_api_key = Bun.env.OPENAI_API_KEY || options.openai_api_key;
    if (typeof openai_api_key === "string") {
      this.openai_api_key = openai_api_key;
    } else {
      throw new Error("OpenAI API key is required");
    }

    const openai_base_url = Bun.env.OPENAI_BASE_URL || options.openai_base_url;
    if (typeof openai_base_url === "string") {
      this.openai_base_url = openai_base_url;
    }

    const openai_model = Bun.env.OPENAI_MODEL || options.openai_model;
    if (typeof openai_model === "string") {
      this.openai_model = openai_model;
    }

    const directory = options.directory;
    if (typeof directory === "string") {
      this.directory = directory;
    } else {
      throw new Error("The directory to analyze is required");
    }

    this.log_level = (options.log_level as LogLevel) || "info";

    if (options.log_color === true || options.log_color === false) {
      this.log_color = options.log_color;
    }

    if (options.log_timestamps === true || options.log_timestamps === false) {
      this.log_timestamps = options.log_timestamps;
    }
  }
}
