import { tool } from "@openai/agents";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

import type { Logger } from "../classes/logger";
import { ToolUtils } from "../utils/toolUtils";

const name = "read_directory_tree";
const description = "Read the contents of a directory and show its hierarchy";
const parametersSchema = z.object({ path: z.string() });

export const readDirectoryTreeTool = (logger: Logger) =>
  tool({
    name,
    description,
    parameters: parametersSchema,
    execute: ToolUtils.wrappedExecute(name, execute, logger),
  });

export async function execute(parameters: z.infer<typeof parametersSchema>) {
  try {
    const tree = getDirectoryTree(parameters.path);
    return `Directory tree for ${parameters.path}:\n${tree}`;
  } catch (error: any) {
    return `Error reading directory: ${error.message}`;
  }
}

function parseGitignore(gitignorePath: string): string[] {
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }

  const content = fs.readFileSync(gitignorePath, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function shouldIgnore(relativePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Handle negation patterns
    if (pattern.startsWith("!")) {
      return false; // We'll handle negations separately
    }

    // Convert pattern to regex
    let regexPattern = pattern
      // Escape special regex characters except * and ?
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      // Convert * to .* and ? to .
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");

    // Handle directory matching
    if (pattern.endsWith("/")) {
      // For directory patterns, match both the directory itself and its contents
      const dirPattern = pattern.slice(0, -1);
      return (
        relativePath === dirPattern || relativePath.startsWith(dirPattern + "/")
      );
    }

    // For regular patterns, do an exact match
    return new RegExp("^" + regexPattern + "$").test(relativePath);
  });
}

function getDirectoryTree(
  dirPath: string,
  prefix = "",
  patterns: string[] = [],
): string {
  let entries = fs.readdirSync(dirPath);
  let result = "";

  const alwaysIgnore = [
    ".git/",
    ".node_modules/",
    ".DS_Store",
    ".env",
    ".venv",
  ];

  // Load .gitignore patterns if not provided
  if (patterns.length === 0) {
    const gitignorePath = path.join(dirPath, ".gitignore");
    patterns = [...alwaysIgnore, ...parseGitignore(gitignorePath)];
  } else {
    patterns = [...alwaysIgnore, ...patterns];
  }

  // Sort entries to ensure consistent order
  entries.sort((a, b) => {
    const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
    const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
    return a.localeCompare(b);
  });

  // Filter out ignored entries before iterating
  entries = entries.filter((entry) => {
    const fullPath = path.join(dirPath, entry);
    const relativePath = path.relative(dirPath, fullPath);
    return !shouldIgnore(relativePath, patterns);
  });

  entries.forEach((entry, index) => {
    const fullPath = path.join(dirPath, entry);
    const isLast = index === entries.length - 1;
    const stats = fs.statSync(fullPath);
    const isDirectory = stats.isDirectory();

    const marker = isLast ? "└── " : "├── ";
    result += `${prefix}${marker}${entry}${isDirectory ? "/" : ""}\n`;

    if (isDirectory) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += getDirectoryTree(fullPath, newPrefix, patterns);
    }
  });

  return result;
}
