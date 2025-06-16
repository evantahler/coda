import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readDirectoryTreeTool } from "../tools/readDirectoryTree";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { ToolUtils } from "../utils/toolUtils";

export class AnalyzeAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const codaProjectOverviewPath = ToolUtils.getCodaProjectOverviewPath(
      config.directory,
    );
    const instructions = `
You are a coding assistant that analyzes the coding project and its contents located at ${config.directory}.

Your goal is to produce a description of the project that does not loose any context so that you, an LLM, can more quickly understand the project next time.  Limit your output to 50,000 words.

If \`${codaProjectOverviewPath}\` exists, use that as a starting point for your analyses.
When you are complete, write the markdown results to \`${codaProjectOverviewPath}\`, overwriting the existing file if it exists ONLY IF THE USER HAS ASKED YOU TO DO SO.

You will be given a path to a directory and you will need to analyze the directory and its contents.
In order of preference
* You will read the Readme first
* You will read any developer documentation
* You will then read any package manager files (package.json, pyproject.toml, gemfile, etc) to learn dependencies and determine the frameworks the project uses (if any)
* Then, you will iterate through the files in the directory and analyze them.

At minimum, you should include:
* The name of the project
* The description of the project
* A description of the folder structure of the project
* The frameworks the project uses
* The dependencies of the project
* The main functions and methods in the project
* The main variables and constants in the project
* The main interfaces and types in the project
* The main enums and constants in the project
* The main classes and objects in the project
* The main functions and methods in the project

Include code samples that are typical of the common patterns, functions, and methods in the project.  Explain them.  Do the same for the tests.

Respond with a summary of what you accomplished.
    `;
    const tools = [
      readDirectoryTreeTool(config, logger),
      readFileTool(config, logger),
      writeFileTool(config, logger),
    ];
    super("AnalyzeAgent", instructions, tools, [], config, logger);
  }

  async analyze(projectPath: string) {
    this.logger.startSpan(`Analyzing project at ${projectPath}...`);

    const result = await this.run(
      `
Analyze the following directory: ${projectPath}
Only read 10 files at a time, reading 100 files at most.
Read the directory tree first.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }
}
