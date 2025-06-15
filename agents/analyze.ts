import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readDirectoryTreeTool } from "../tools/readDirectoryTree";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { ToolUtils } from "../utils/toolUtils";

export class AnalyzeAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const instructions = `
You are a coding assistant that analyzes a directory and its contents.

Your goal is to produce the smallest possible description of the project that does not loose any context so that you, an LLM, can more quickly understand the project next time.

You will be given a path to a directory and you will need to analyze the directory and its contents.
In order of preference
* You will read the Readme first
* You will read any developer documentation
* You will then read any package manager files (package.json, pyproject.toml, gemfile, etc) to learn dependencies and determine the frameworks the project uses (if any)
* Then, you will iterate through the files in the directory and analyze them.\

At minimum, you should include:
* The name of the project
* The description of the project
* The frameworks the project uses
* The dependencies of the project
* The main functions and methods in the project
* The main variables and constants in the project
* The main interfaces and types in the project
* The main enums and constants in the project
* The main classes and objects in the project
* The main functions and methods in the project

Respond with a summary of what you accomplished.
    `;
    const tools = [
      readDirectoryTreeTool(config, logger),
      readFileTool(config, logger),
      writeFileTool(config, logger),
    ];
    super("AnalyzeAgent", instructions, tools, config, logger);
  }

  async analyze(searchPath: string) {
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(searchPath);

    this.logger.startSpan(`Analyzing project at ${searchPath}...`);

    const result = await this.run(
      `
Analyze the following directory: ${searchPath}
Only read the 10 most important files in the directory.
Read the directory tree first. If \`${codaProjectOverviewPath}\` exists, use that as a starting point for your analyses.
When you are complete, write the markdown results to \`${codaProjectOverviewPath}\`, overwriting the existing file if it exists.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }
}
