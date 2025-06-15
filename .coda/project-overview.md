# CODA

A local project summarizer and code analysis agent CLI. Written in TypeScript, powered by Bun and the OpenAI Agents SDK. Coda efficiently examines codebases and produces concise markdown overviews for rapid understanding by humans or LLMs.

---

## Project Overview

Coda recursively analyzes source directories, reads README/developer docs, infers dependencies (from `package.json`, etc), inspects main functions/classes/types, and summarizes the entire project. Parallel file analysis via Bun ensures speed. Output is saved as markdown to `.coda/project-overview.md`.

---

## Main Features

- **Fast:** Bun-powered and parallelized file analysis.
- **Local:** Runs fully offline, no cloud required.
- **Extensible:** Modular, agent- and tool-based (OpenAI Agents SDK). New analysis tools can be plugged in easily.
- **LLM-friendly Output:** Produces structured markdown for rapid review by people or LLMs.
- **Sandboxed execution:** Isolates analysis logic for safety.

---

## Usage

```sh
bun coda.ts analyze [path] [options]
```

Options include specifying OpenAI API key, model, log colorization, and log levels via CLI or environment variables.

---

## Frameworks & Dependencies

- **Runtime:** Bun (TypeScript-first, modern JS/TS dev experience)
- **Languages:** TypeScript
- **LLM SDK:** `@openai/agents`
- **CLI:** `@commander-js/extra-typings`, `commander` (peer dep)
- **Formatting:** `chalk`, `ora`, `prettier`, `@trivago/prettier-plugin-sort-imports`
- **Validation:** `zod`
- **Testing:** `bun:test`

### `package.json` dependencies

```json
{
  "dependencies": {
    "@commander-js/extra-typings": "^14.0.0",
    "@openai/agents": "^0.0.7",
    "chalk": "^5.4.1",
    "ora": "^8.2.0",
    "zod": "^3.25.64"
  },
  "devDependencies": {
    "@trivago/prettier-plugin-sort-imports": "^5.2.2",
    "@types/bun": "latest",
    "prettier": "^3.5.3"
  },
  "peerDependencies": {
    "commander": "^14.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Project Structure

```
- coda.ts (CLI entry)
- agents/analyze.ts
- classes/
  - codaAgent.ts, config.ts, logger.ts
- tools/
  - readDirectoryTree.ts, readFile.ts, writeFile.ts
- utils/toolUtils.ts
- assets/ascii/ (art for CLI)
- .coda/project-overview.md (output for summaries)
- README.md
- package.json
- tsconfig.json
- .github/workflows/test.yml (CI)
```

---

## Main Classes, Enums, and Types

### `coda.ts` (Main Entry)

- Parses CLI arguments using Commander.
- Displays usage, pulls project version/name from `package.json`, includes ASCII art.
- Launches `AnalyzeAgent` with config and logger.

### `agents/analyze.ts`

- Defines the `AnalyzeAgent`, which extends `CodaAgent`.
- Orchestrates end-to-end analysis: directory walk via `readDirectoryTreeTool`, per-file reads, summary writing, etc.
- Defines the top-level instructions/goals for the code analysis agent.

### `classes/codaAgent.ts`

- Defines abstract `CodaAgent`, the core agent contract, which wraps the OpenAI Agents SDK.
- Configures model, tools, and provides `.run(prompt)` method.
- Events: `DEBUG`, `ERROR`, `LOG` (via `CodaAgentEvent` and `CodaAgentEventMap`).

### `classes/config.ts`

- Runtime configuration loader for agent/API keys, directory, log settings, etc.
- Handles merging CLI, .env, and environment variables.

### `classes/logger.ts`

- Provides colored, leveled CLI logging and span-based progress display via `chalk` and `ora`.
- Log levels: DEBUG, INFO, WARN, ERROR (`LogLevel`).
- `Logger.startSpan`, `Logger.updateSpan`, `Logger.endSpan` methods for progress indication.

### `tools/readDirectoryTree.ts`

- Implements a tool for printing directory structure, respecting `.gitignore`.
- Key function: `getDirectoryTree()`.

### `tools/readFile.ts`

- A pluggable tool to read file contents as markdown code blocks for analysis.

### `tools/writeFile.ts`

- Tool for writing string content to a file, sandboxed to only permit writing inside the configured project directory.

### `utils/toolUtils.ts`

- Helpers for tool wrapping, standardizing tool execution, path helpers, and ensuring output directory structure.

### `assets/ascii/`

- Provides ASCII art assets (happy/neutral/sad bots).
- Coloring is handled via `chalk`. Used for CLI branding and status cues.

### Test Files

- Use `bun:test` to validate correctness and edge cases of tools, logger, and ASCII asset rendering.
- Example: tools refuse to write outside allowed directory, respect .gitignore, etc.

---

## Key Methods and Responsibilities

- **AnalyzeAgent.analyze(path):** Drives project summarization workflow.
- **CodaAgent.run(prompt):** Generalized LLM-agent invocation.
- **Config:** Loads/validates all runtime/CLI/API options.
- **Logger:** Pretty, colored, level-controlled logging and task progress.
- **readDirectoryTreeTool:** Generates markdown directory trees.
- **readFileTool:** Returns files as markdown code blocks.
- **writeFileTool:** Verifies and writes markdown output within sandbox.
- **ToolUtils:** Handles output directory setup and standard tool invocation reporting.

---

## Extensibility, Security, and Design Details

- **Modular, pluggable tools** via the Agents SDK; easy to add more project analysis functions.
- **Sandboxed file writes** — never writes outside of analyzed project.
- **All file/directory reads are filtered loosely by `.gitignore` and common ignores** for speedy, safe analysis.
- **Parallel execution** possible, leveraging Bun features, for larger projects.
- **Tests** cover file read/write edge cases, .gitignore honoring, and CLI/log behaviors.

---

## Configuration and Environment

- Config values come from environment, `.env`, and CLI args.
- Defaults/logging can be adjusted; OpenAI (or Anthropic, with tweaks) is supported for LLM functions.
- Environment variable support: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` (see `.env.example`).

---

## CI/CD

- GitHub Actions in `.github/workflows/test.yml` sets up Bun, installs, runs tests after push/pull to main.

---

## Author & License

Evan Tahler <evan@evantahler.com> — MIT Licensed

---

## Summary of Accomplishments

- Analyzed every main source/test/configuration file in the top 100 files of the repository.
- Extracted project structure, agent and tool classes, CLI entrypoint logic, logging/config design, and test suite coverage.
- Outlined all key responsibilities, class hierarchies, main types, dependencies, and extensibility points.
- Included details helpful for LLM or developer bootstrapping: high-level strategy, extensibility, and safety boundaries.
