# CODA

A local coding agent written in TypeScript, using Bun and the OpenAI Agents SDK.

---

## Overview

**Coda** is a CLI tool for analyzing code directories and producing concise, context-rich markdown summaries—ideal for large language models (LLMs) to understand and ingest. It extracts and aggregates the key elements of a project: description, structure, dependencies, frameworks, main classes and types, functions, and more.

---

## Features

- **Fast:** Parallel execution via Bun.
- **Local:** Runs fully on your machine.
- **Flexible:** Works with multiple LLM APIs (OpenAI, Anthropic, etc.).
- **Extensible:** Easily add or modify analysis tools.
- **Safe:** Executes all code in contained environments.

---

## Usage

```bash
bun coda.ts analyze [path] [options]
```

- `path`: Directory to analyze (defaults to current working directory).
- Options:
  - `-k, --api_key <api_key>`: OpenAI API Key (or `OPENAI_API_KEY` env var)
  - `-b, --base_url [base_url]`: Custom OpenAI API Base URL
  - `-m, --model [model]`: Model name for OpenAI API
  - `-l, --log_level [level]`: Log level: debug, info, warn, error
  - `-c, --colorize [colorize]`: Colorize log output
  - `-t, --timestamps [timestamps]`: Timestamps in log output

**Environment variables:** (`.env` supported)
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `LOG_LEVEL`
- `LOG_COLOR`
- `LOG_TIMESTAMPS`

---

## Project Structure

- `coda.ts`: CLI entry point, sets up the `analyze` command.
- `agents/analyze.ts`: Core directory analysis logic.
- `classes/codaAgent.ts`: Event-driven, abstract base class for LLM agents.
- `classes/logger.ts`: Manages event logging (colors, timestamps).
- `tools/readDirectoryTree.ts`: Reads and formats directory trees (respects `.gitignore`).
- `tools/readFile.ts`: Reads file contents as text.
- `assets/ascii/`: CLI ASCII art feedback.
- `utils/toolUtils.ts`: Utility helpers for tools and execution.

---

## Main Classes, Types, Functions

### `CodaAgent` (abstract class)
- **Purpose:** Base for all LLM coding agents in the project.
- **Properties:**  
  - `agent`: OpenAI Agent object  
  - `name`, `instructions`, `tools`, `config`, `logger`
- **Methods:**  
  - `run(prompt)`: Run LLM prompt with event-driven logging.

#### Types & Enums
- `CodaAgentEvent` (enum): `DEBUG`, `ERROR`, `LOG`
- `CodaAgentEventMap`: Event → parameter signature mapping

### `AnalyzeAgent` (extends `CodaAgent`)
- **Purpose:** Aggregates project information via specialized tools and LLM analysis.
- **Method:** `analyze(path)`: Runs project analysis, generates markdown summary.

### `Logger`
- **Purpose:** Formats CLI output based on agent events.
- **Log Levels:** `DEBUG`, `INFO`, `WARN`, `ERROR`
- **Features:** Color output, timestamps

### Tools

- **readDirectoryTreeTool:** Reads and formats directory trees (respects `.gitignore`).
- **readFileTool:** Reads file contents as a string.

### Utility

- `ToolUtils`: Methods for supporting tool operations (directory creation, timing execution, etc.).

---

## Frameworks & Dependencies

- **Runtime:** Bun (JS/TS runtime)
- **Language:** TypeScript (ESNext)
- **LLM SDK:** `@openai/agents`, `openai`
- **CLI:** `@commander-js/extra-typings`, `commander` (peer)
- **Formatting/Color:** `chalk`
- **Validation:** `zod`
- **Testing:** `bun:test`
- **Dev:** Prettier, sort-imports plugin, bun typings

---

## Example Output

Analysis summaries are automatically written to `.coda/project-overview.md` in the analyzed directory.

---

## Testing

Run with Bun's built-in test runner:

```sh
bun test
```

Tests include ASCII output, directory tree and file reading tools, etc.

---

## Extensibility

Add new tools by implementing the tool interface from `@openai/agents` and registering them with agent tool arrays.

---

## Author

[Evan Tahler](mailto:evan@evantahler.com)

---

## License

MIT (see package.json)
