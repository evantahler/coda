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
    const codaProjectOverviewPath = ToolUtils.getCodaProjectOverviewPath(
      config.directory,
    );
    const codaCommandsPath = ToolUtils.getCodaCommandsPath(config.directory);
    const instructions = `
You are an agent who manages the list of approved commands for the project.
You are responsible for managing everything in a single file located at ${codaCommandsPath}.

Load the additional context from the project overview file: ${codaProjectOverviewPath}.

NEVER ADD COMMANDS THAT HAVE NOT BEEN APPROVED BY THE USER.

NEVER RUN COMMANDS THAT HAVE NOT BEEN APPROVED BY THE USER.

The structure of a markdown command file is:

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
    super("CommandsAgent", instructions, tools, [], config, logger);
  }

  async addCommand(
    command: string,
    description: string | undefined,
    category: string | undefined,
    usage: string | undefined,
    example: string | undefined,
  ) {
    this.logger.startSpan(`Adding command...`);

    const result = await this.run(
      `
The date is ${new Date().toISOString()}.
The command details are:
---
Command: \`${command}\`
Description: ${description ?? "undefined - make one up based on the command"}
Category: ${category ?? "undefined - make one up based on the command"}
Usage: ${usage ?? "undefined - make one up based on the command"}
Example: ${example ?? "undefined - make one up based on the command"}
---

Save the changes to the commands file.

UNDER NO CIRCUMSTANCES SHOULD YOU RUN THE COMMAND.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async removeCommand(commandIdentifier: string) {
    this.logger.startSpan(`Removing command...`);

    const result = await this.run(
      `
Remove the following command from the commands file.
The name of the command to remove is: \`${commandIdentifier}\`.
Update the commands file to reflect the removal.

UNDER NO CIRCUMSTANCES SHOULD YOU RUN THE COMMAND.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async listCommands() {
    this.logger.startSpan(`Listing commands...`);

    const result = await this.run(
      `
List all commands in the commands file.
Respond with a markdown table of the commands, grouped by category.

UNDER NO CIRCUMSTANCES SHOULD YOU RUN THE COMMAND.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }

  async runCommand(commandIdentifier: string) {
    this.logger.startSpan(`Running command...`);

    const result = await this.run(
      `
Use the run_command tool to execute the command: \`${commandIdentifier}\`.

If the command succeeds, only respond with the output of the command.
If the command fails, respond with the error message only.
      `,
    );

    this.logger.endSpan(result.finalOutput);
  }
}
