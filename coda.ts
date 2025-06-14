import { program } from "@commander-js/extra-typings";
import { EOL } from "os";
import { join } from "path";

import { AnalyzeAgent } from "./agents/analyze";
import { BotHappy } from "./assets/ascii/ascii.test";
import { AgentLogger } from "./classes/agentLogger";
import * as pkg from "./package.json";

program
  .version(pkg.version)
  .name(pkg.name)
  .description(pkg.description + EOL + EOL + BotHappy);

program
  .command("analyze")
  .description("Analyze a directory")
  .argument("[path]", "The path to the directory to analyze", process.cwd())
  .option(
    "-k, --api_key <api_key>",
    "The OpenAI API key (also loaded from process.env.OPENAI_API_KEY or same name in .env)",
    process.env.OPENAI_API_KEY,
  )
  .option(
    "-b, --base_url [base_url]",
    "The OpenAI base URL (also loaded from process.env.OPENAI_BASE_URL or same name in .env)",
    process.env.OPENAI_BASE_URL,
  )
  .option(
    "-m, --model [model]",
    "The OpenAI model (also loaded from process.env.OPENAI_MODEL or same name in .env)",
    process.env.OPENAI_MODEL,
  )
  .action(async (path: string, options) => {
    const agent = new AnalyzeAgent(
      `${options.api_key}`,
      options.base_url ? `${options.base_url}` : undefined,
      options.model ? `${options.model}` : undefined,
    );

    const logger = new AgentLogger(agent);

    await agent.analyze(path);
    logger.end();

    process.exit(0);
  });

program.parse();
