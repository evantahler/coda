import { CodaAgent } from "../classes/codaAgent";
import { readDirectoryTreeTool } from "../tools/readDirectoryTree";

export class AnalyzeAgent extends CodaAgent {
  constructor(
    apiKey: string,
    baseUrl: string | undefined,
    model: string | undefined,
  ) {
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

    `;
    const tools = [readDirectoryTreeTool];
    super("AnalyzeAgent", instructions, tools, apiKey, baseUrl, model);
  }

  async analyze(path: string) {
    const startingMessage = `Analyzing ${path}`;
    const endingMessage = `Completed analyzing ${path}`;

    const result = await this.run(
      `Analyze the following directory: ${path}`,
      startingMessage,
      endingMessage,
    );

    return result;
  }
}
