import { program } from "@commander-js/extra-typings";
import { EOL } from "os";

import { AnalyzeAgent } from "./agents/analyze";
import { CommandsAgent } from "./agents/commands";
import { MemoryAgent } from "./agents/memory";
import { BotHappy } from "./assets/ascii/ascii.test";
import { Config } from "./classes/config";
import { Logger } from "./classes/logger";
import * as pkg from "./package.json";

interface CommonOptions {
  directory?: string;
  log_level?: string;
  colorize?: string;
  timestamps?: string;
  [key: string]: string | boolean | undefined;
}

function addCommonOptions(command: any) {
  return command
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
    );
}

program
  .version(pkg.version)
  .name(pkg.name)
  .description(pkg.description + EOL + EOL + BotHappy);

program
  .command("analyze")
  .description("Analyze a directory")
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
  .action(async (options: CommonOptions) => {
    const config = new Config(options);
    const logger = new Logger(config);
    const agent = new AnalyzeAgent(config, logger);

    await agent.analyze(config.directory);

    process.exit(0);
  });

addCommonOptions(program.commands[0]);

const memoryCommand = program
  .command("memory")
  .description("Manage memory entries");

addCommonOptions(
  memoryCommand.command("list").description("List all memory entries"),
).action(async (options: CommonOptions) => {
  const config = new Config(options);
  const logger = new Logger(config);
  const agent = new MemoryAgent(config, logger);

  await agent.listMemoryItems(config.directory);

  process.exit(0);
});

addCommonOptions(
  memoryCommand
    .command("add")
    .description("Add a new memory entry")
    .argument("<content>", "The content to add to memory")
    .option("--title [title]", "The title of the memory entry"),
).action(
  async (
    content: string,
    options: CommonOptions & { title: string | undefined },
  ) => {
    const config = new Config(options);
    const logger = new Logger(config);
    const agent = new MemoryAgent(config, logger);

    await agent.addMemoryItem(config.directory, content, options.title);

    process.exit(0);
  },
);

addCommonOptions(
  memoryCommand
    .command("remove")
    .description("Remove a memory entry")
    .argument(
      "<description>",
      "The description of the memory entry to remove (id, title, etc)",
    ),
).action(async (description: string, options: CommonOptions) => {
  const config = new Config(options);
  const logger = new Logger(config);
  const agent = new MemoryAgent(config, logger);

  await agent.removeMemoryItem(config.directory, description);

  process.exit(0);
});

const commandsCommand = program
  .command("command")
  .description("Manage executable commands");

addCommonOptions(
  commandsCommand.command("list").description("List all executable commands"),
).action(async (options: CommonOptions) => {
  const config = new Config(options);
  const logger = new Logger(config);
  const agent = new CommandsAgent(config, logger);

  await agent.listCommands(config.directory);

  process.exit(0);
});

addCommonOptions(
  commandsCommand
    .command("add")
    .description("Add a new executable command")
    .argument("<command>", "The command to add a new executable command")
    .option("--description [description]", "The description of the command")
    .option("--category [category]", "The category of the command")
    .option("--usage [usage]", "The usage of the command")
    .option("--example [example]", "The example of the command"),
).action(
  async (
    command: string,
    options: CommonOptions & {
      description: string | undefined;
      category: string | undefined;
      usage: string | undefined;
      example: string | undefined;
    },
  ) => {
    const config = new Config(options);
    const logger = new Logger(config);
    const agent = new CommandsAgent(config, logger);

    await agent.addCommand(
      config.directory,
      command,
      options.description,
      options.category,
      options.usage,
      options.example,
    );

    process.exit(0);
  },
);

addCommonOptions(
  commandsCommand
    .command("remove")
    .description("Remove an executable command")
    .argument(
      "<command>",
      "The command to remove from the list of executable commands",
    ),
).action(async (description: string, options: CommonOptions) => {
  const config = new Config(options);
  const logger = new Logger(config);
  const agent = new CommandsAgent(config, logger);

  await agent.removeCommand(config.directory, description);

  process.exit(0);
});

addCommonOptions(
  commandsCommand
    .command("run")
    .description("Run an executable command")
    .argument(
      "<cmd>",
      "The command to run from the list of executable commands",
    ),
).action(async (cmd: string, options: CommonOptions) => {
  const config = new Config(options);
  const logger = new Logger(config);
  const agent = new CommandsAgent(config, logger);

  await agent.runCommand(config.directory, cmd);

  process.exit(0);
});

program.parse();
