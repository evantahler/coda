import * as fs from "fs";

import { CodaAgent } from "../classes/codaAgent";
import { readDirectoryTreeTool } from "../tools/readDirectoryTree";
import { readFileTool } from "../tools/readFile";
import { ToolUtils } from "../utils/toolUtils";

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

Respond with EXACTLY and ONLY the markdown content that should be saved in a README.md file.

    `;
    const tools = [readDirectoryTreeTool, readFileTool];
    super("AnalyzeAgent", instructions, tools, apiKey, baseUrl, model);
  }

  async analyze(searchPath: string) {
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(searchPath);

    const startingMessage = `Analyzing ${searchPath}`;
    const endingMessage = `Completed analyzing ${searchPath}`;

    const result = await this.run(
      `Analyze the following directory: ${searchPath}
      Read the directory tree first.
      If ${codaProjectOverviewPath} exists, use that as a starting point for your analyses`,
      startingMessage,
      endingMessage,
    );

    const possibleText = result.finalOutput;
    if (!possibleText) {
      throw new Error("No response from agent");
    }

    const successCheck = await this.run(
      `
      Is the following text a valid markdown file, and does it succeed in describing the project?

      ---response---
      ${possibleText}
      ---response---

      Respond with EXACTLY and ONLY the word "yes" or "no".
      `,
    );

    if (successCheck.finalOutput?.toLowerCase().trim() === "yes") {
      fs.writeFileSync(codaProjectOverviewPath, possibleText);
      return `Successfully analyzed project, written to ${codaProjectOverviewPath}`;
    }

    return "Failed to analyze project";
  }
}
