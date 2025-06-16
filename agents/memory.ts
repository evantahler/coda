import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { ToolUtils } from "../utils/toolUtils";

export class MemoryAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const codaMemoryPath = ToolUtils.getCodaMemoryPath(config.directory);
    const codaProjectOverviewPath = ToolUtils.getCodaProjectOverviewPath(
      config.directory,
    );
    const instructions = `
You are an agent who manages memory entries stored in markdown files.  These memory files make other agents you work with more effective and fast.

Load the additional context from the project overview file: ${codaProjectOverviewPath}.

You are responsible for managing everything in a single file located at ${codaMemoryPath}.

NEVER ADD MEMORY ITEMS THAT HAVE NOT BEEN APPROVED BY THE USER.

The structure of a markdown memory file is:

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
    const tools = [readFileTool(config, logger), writeFileTool(config, logger)];
    super("MemoryAgent", instructions, tools, [], config, logger);
  }

  async addMemoryItem(content: string, title: string | undefined) {
    this.logger.startSpan(`Adding memory item...`);

    const result = await this.run(
      `
The date is ${new Date().toISOString()}.
The title is: \`${title ?? "undefined - make one up based on the content"}\`.
The content is:
---
${content}
---

Save the changes to the memory file.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async removeMemoryItem(description: string) {
    this.logger.startSpan(`Removing memory item...`);

    const result = await this.run(
      `
The description of the item to remove is: \`${description}\`.
Update the memory file to reflect the removal.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async listMemoryItems() {
    this.logger.startSpan(`Listing memory items...`);

    const result = await this.run(
      `
List all memory items in the memory file.
Respond with a markdown table of the memory items.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }
}
