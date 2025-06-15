import { CodaAgent } from "../classes/codaAgent";
import type { Config } from "../classes/config";
import type { Logger } from "../classes/logger";
import { readDirectoryTreeTool } from "../tools/readDirectoryTree";
import { readFileTool } from "../tools/readFile";
import { runCommandTool } from "../tools/runCommand";
import { writeFileTool } from "../tools/writeFile";
import { ToolUtils } from "../utils/toolUtils";

export class CommandsAgent extends CodaAgent {
  constructor(config: Config, logger: Logger) {
    const instructions = `
You are an agent who manages command entries stored in markdown files. These command files help document and organize common commands used in the project.
You are responsible for managing everything in a single file that you will be given a path to. The structure of a markdown command file is:

<Example>
# COMMANDS

## 1. Command Name
** Date Added: YYYY-MM-DD **
** Category: [Category Name] **
> Command: \`command to run\`
> Description: Brief description of what the command does
> Usage: How to use the command
> Example: Example usage of the command

## 2. Command Name
** Date Added: YYYY-MM-DD **
** Category: [Category Name] **
> Command: \`command to run\`
> Description: Brief description of what the command does
> Usage: How to use the command
> Example: Example usage of the command
</Example>

Every command entry should have:
- A unique name that clearly identifies the command
- The date it was added
- A category to group similar commands
- The actual command to run
- A description of what the command does
- Usage instructions
- An example of how to use the command

Respond with a summary of what you accomplished.
    `;
    const tools = [
      readDirectoryTreeTool(config, logger),
      readFileTool(config, logger),
      writeFileTool(config, logger),
      runCommandTool(config, logger),
    ];
    super("CommandsAgent", instructions, tools, config, logger);
  }

  async addCommand(
    projectPath: string,
    command: string,
    description: string | undefined,
    category: string | undefined,
    usage: string | undefined,
    example: string | undefined,
  ) {
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    const codaCommandsPath = ToolUtils.getCodaCommandsPath(projectPath);

    this.logger.startSpan(`Adding command to ${codaCommandsPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.

Store the following command in the commands file: ${codaCommandsPath}.
The date is ${new Date().toISOString()}.
The command details are:
---
Command: \`${command}\`
Description: ${description ?? "undefined - make one up based on the command"}
Category: ${category ?? "undefined - make one up based on the command"}
Usage: ${usage ?? "undefined - make one up based on the command"}
Example: ${example ?? "undefined - make one up based on the command"}
---

Save the changes to the commands file to the file: ${codaCommandsPath}.

UNDER NO CIRCUMSTANCES SHOULD YOU RUN THE COMMAND.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async removeCommand(projectPath: string, commandIdentifier: string) {
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    const codaCommandsPath = ToolUtils.getCodaCommandsPath(projectPath);

    this.logger.startSpan(`Removing command from ${codaCommandsPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.

Remove the following command from the commands file: ${codaCommandsPath}.
The name of the command to remove is: \`${commandIdentifier}\`.
Update the commands file to reflect the removal.

UNDER NO CIRCUMSTANCES SHOULD YOU RUN THE COMMAND.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async listCommands(projectPath: string) {
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    const codaCommandsPath = ToolUtils.getCodaCommandsPath(projectPath);

    this.logger.startSpan(`Listing commands from ${codaCommandsPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.

List all commands in the commands file: ${codaCommandsPath}.
Respond with a markdown table of the commands, grouped by category.

UNDER NO CIRCUMSTANCES SHOULD YOU RUN THE COMMAND.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async runCommand(projectPath: string, commandIdentifier: string) {
    const codaProjectOverviewPath =
      ToolUtils.getCodaProjectOverviewPath(projectPath);
    const codaCommandsPath = ToolUtils.getCodaCommandsPath(projectPath);

    this.logger.startSpan(`Running command from ${codaCommandsPath}...`);

    const result = await this.run(
      `
Load the additional context from the project overview file: ${codaProjectOverviewPath}.
Use the run_command tool to execute the command: \`${commandIdentifier}\`.

If the command succeeds, only respond with the output of the command.
If the command fails, respond with the error message only.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }
}
