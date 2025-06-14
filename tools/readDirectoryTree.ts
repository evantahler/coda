import { tool } from "@openai/agents";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

const parametersSchema = z.object({ path: z.string() });

export const readDirectoryTreeTool = tool({
  name: "read_directory_tree",
  description: "Read the contents of a directory and show its hierarchy",
  parameters: parametersSchema,
  execute,
});

export async function execute(parameters: z.infer<typeof parametersSchema>) {
  try {
    const tree = getDirectoryTree(parameters.path);
    return `Directory tree for ${parameters.path}:\n${tree}`;
  } catch (error: any) {
    return `Error reading directory: ${error.message}`;
  }
}

function getDirectoryTree(dirPath: string, prefix = ""): string {
  const entries = fs.readdirSync(dirPath);
  let result = "";

  entries.forEach((entry, index) => {
    const fullPath = path.join(dirPath, entry);
    const isLast = index === entries.length - 1;
    const stats = fs.statSync(fullPath);
    const isDirectory = stats.isDirectory();

    const marker = isLast ? "└── " : "├── ";
    result += `${prefix}${marker}${entry}${isDirectory ? "/" : ""}\n`;

    if (isDirectory) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += getDirectoryTree(fullPath, newPrefix);
    }
  });

  return result;
}
