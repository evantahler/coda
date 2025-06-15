import { program } from "@commander-js/extra-typings";
import { EOL } from "os";

import { AnalyzeAgent } from "./agents/analyze";
import { BotHappy } from "./assets/ascii/ascii.test";
import { Config } from "./classes/config";
import { Logger } from "./classes/logger";
import * as pkg from "./package.json";

program
  .version(pkg.version)
  .name(pkg.name)
  .description(pkg.description + EOL + EOL + BotHappy);

program
  .command("analyze")
  .description("Analyze a directory")
  .option(
    "-d, --directory [directory]",
    "The path to the directory to analyze",
    process.cwd(),
  )
  .option(
    "-k, --openai_api_key [api_key]",
    "The OpenAI API key (also loaded from process.env.OPENAI_API_KEY or same name in .env)",
  )
  .option(
    "-b, --openai_base_url [base_url]",
    "The OpenAI base URL (also loaded from process.env.OPENAI_BASE_URL or same name in .env)",
  )
  .option(
    "-m, --openai_model [model]",
    "The OpenAI model (also loaded from process.env.OPENAI_MODEL or same name in .env)",
  )
  .option(
    "-l, --log_level [level]",
    "The log level.  Options are: debug, info, warn, error",
    process.env.LOG_LEVEL,
  )
  .option(
    "-c, --colorize [colorize]",
    "Colorize the log output",
    process.env.LOG_COLOR,
  )
  .option(
    "-t, --timestamps [timestamps]",
    "Include timestamps in the log output",
    process.env.LOG_TIMESTAMPS,
  )
  .action(async (options) => {
    const config = new Config(options);
    const logger = new Logger(config);
    const agent = new AnalyzeAgent(config, logger);

    await agent.analyze(config.directory);

    process.exit(0);
  });

const memoryCommand = program
  .command("memory")
  .description("Manage memory entries");

memoryCommand
  .command("list")
  .description("List all memory entries")
  .option(
    "-d, --directory [directory]",
    "The path to the directory to analyze",
    process.cwd(),
  )
  .option(
    "-l, --log_level [level]",
    "The log level.  Options are: debug, info, warn, error",
    process.env.LOG_LEVEL,
  )
  .option(
    "-c, --colorize [colorize]",
    "Colorize the log output",
    process.env.LOG_COLOR,
  )
  .option(
    "-t, --timestamps [timestamps]",
    "Include timestamps in the log output",
    process.env.LOG_TIMESTAMPS,
  )
  .action(async (options) => {
    const config = new Config(options);
    const logger = new Logger(config);
    // TODO: Implement memory listing logic
    logger.info("Listing memory entries...");
    process.exit(0);
  });

memoryCommand
  .command("add")
  .description("Add a new memory entry")
  .option(
    "-d, --directory [directory]",
    "The path to the directory to analyze",
    process.cwd(),
  )
  .option(
    "-l, --log_level [level]",
    "The log level.  Options are: debug, info, warn, error",
    process.env.LOG_LEVEL,
  )
  .option(
    "-c, --colorize [colorize]",
    "Colorize the log output",
    process.env.LOG_COLOR,
  )
  .option(
    "-t, --timestamps [timestamps]",
    "Include timestamps in the log output",
    process.env.LOG_TIMESTAMPS,
  )
  .argument("<content>", "The content to add to memory")
  .action(async (content, options) => {
    const config = new Config(options);
    const logger = new Logger(config);
    // TODO: Implement memory addition logic
    logger.info(`Adding memory entry: ${content}`);
    process.exit(0);
  });

memoryCommand
  .command("remove")
  .description("Remove a memory entry")
  .option(
    "-d, --directory [directory]",
    "The path to the directory to analyze",
    process.cwd(),
  )
  .option(
    "-l, --log_level [level]",
    "The log level.  Options are: debug, info, warn, error",
    process.env.LOG_LEVEL,
  )
  .option(
    "-c, --colorize [colorize]",
    "Colorize the log output",
    process.env.LOG_COLOR,
  )
  .option(
    "-t, --timestamps [timestamps]",
    "Include timestamps in the log output",
    process.env.LOG_TIMESTAMPS,
  )
  .argument("<id>", "The ID of the memory entry to remove")
  .action(async (id, options) => {
    const config = new Config(options);
    const logger = new Logger(config);
    // TODO: Implement memory removal logic
    logger.info(`Removing memory entry with ID: ${id}`);
    process.exit(0);
  });

program.parse();
