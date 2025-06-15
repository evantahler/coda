import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readDirectoryTreeTool } from "../tools/readDirectoryTree";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { ToolUtils } from "../utils/toolUtils";

export class MemoryAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const instructions = `
You are an agent who manages memory entries stored in markdown files.  These memory files make other agents you work with more effective and fast.
You are responsible for managing everything in a single file that you will be given a path to.  The structure of a markdown memory file is:

<Example>
# TITLE

## 1. Memory Item Name
** Date Created: YYYY-MM-DD **
> Memory Item Content

## 2. Memory Item Name
** Date Created: YYYY-MM-DD **
> Memory Item Content
</Example>

Every memory item should have a unique name.  The name should be a short, descriptive phrase that captures the essence of the memory item.
Every memory item should have a date created.  The date created should be the date and time the memory item was created.
Every memory item should have content.  The content should be a brief description of the memory item.

Respond with a summary of what you accomplished.
    `;
    const tools = [
      readDirectoryTreeTool(config, logger),
      readFileTool(config, logger),
      writeFileTool(config, logger),
    ];
    super("MemoryAgent", instructions, tools, config, logger);
  }

  async addMemoryItem(
    projectPath: string,
    content: string,
    title: string | undefined,
  ) {
    const codaMemoryPath = ToolUtils.getCodaMemoryPath(projectPath);
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    this.logger.startSpan(`Adding memory item to ${codaMemoryPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.

Store the following memory item in the memory file: ${codaMemoryPath}.
The date is ${new Date().toISOString()}.
The title is: \`${title ?? "undefined - make one up based on the content"}\`.
The content is:
---
${content}
---

Save the changes to the memory file to the path: ${codaMemoryPath}.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async removeMemoryItem(projectPath: string, description: string) {
    const codaMemoryPath = ToolUtils.getCodaMemoryPath(projectPath);
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    this.logger.startSpan(`Removing memory item from ${codaMemoryPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.

Remove the following memory item from the memory file: ${codaMemoryPath}.
The description of the item to remove is: \`${description}\`.
Update the memory file to reflect the removal.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async listMemoryItems(projectPath: string) {
    const codaMemoryPath = ToolUtils.getCodaMemoryPath(projectPath);
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    this.logger.startSpan(`Listing memory items from ${codaMemoryPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.

List all memory items in the memory file: ${codaMemoryPath}.
Respond with a markdown table of the memory items.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }
}
