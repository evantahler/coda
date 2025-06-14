# CODA

A local coding agent written in TypeScript, using Bun and the OpenAI Agents SDK.

---

## Overview

**Coda** is a CLI tool that analyzes code directories and generates concise, context-rich markdown project summaries—ideal for LLMs (large language models) to understand and ingest. The analysis gathers key information about project structure, purpose, types, main functions, and dependencies.

---

## Features

- **Fast:** Parallel task execution powered by Bun.
- **Local:** Runs entirely on your machine—no cloud dependencies.
- **Flexible:** Works with any LLM API (ex. OpenAI, Anthropic).
- **Extensible:** Add or modify analysis tools easily.
- **Safe:** Executes all code in isolated containers.

---

## Core Functionality

- Reads project directories, preferring README, developer docs, and package files.
- Uses tools to read directory tree and file contents, ignoring paths per gitignore.
- Aggregates key project data: description, dependencies, frameworks, key types/classes/functions.
- Outputs a compact, complete markdown overview file.

---

## CLI Usage

```
bun coda.ts analyze [path] [options]
```
- `path`: Directory to analyze (defaults to current working directory).
- Options:
  - `-k, --api_key <api_key>`: OpenAI API Key (`OPENAI_API_KEY` env also supported)
  - `-b, --base_url [base_url]`: Custom OpenAI API Base URL
  - `-m, --model [model]`: Model name for OpenAI API

Environment variables can also be set via `.env` file:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`

---

## Project Structure

- `coda.ts`: CLI entry point, sets up the analysis command.
- `agents/analyze.ts`: Analyzes project directories using CodaAgent, applies the main extraction logic and ensures result quality.
- `classes/codaAgent.ts`: Abstract base class for coding agents. Event-driven, with logging and generic LLM prompt evaluation.
- `classes/agentLogger.ts`: Handles logging events (with color and timestamps).
- `tools/readDirectoryTree.ts`: Tool to read directory structure, honors `.gitignore`.
- `tools/readFile.ts`: Tool to read and return file contents.
- `utils/toolUtils.ts`: Shared utilities (e.g., project paths, execution wrappers).
- `assets/ascii/`: ASCII art for CLI feedback outputs.

---

## Main Classes and Types

### `CodaAgent` (abstract)
- Event-driven agent for LLM-based coding tasks.
- Properties:
  - `agent`: OpenAI Agent object.
  - Internal event emitter (`log`, `debug`, `error` support).
- Methods:
  - `run(prompt, startMsg?, endMsg?)`: Run an LLM prompt.
  - Event handling: `on(event, listener)`, `emit`, etc.
- Types:
  - `CodaAgentEvent` (enum): `DEBUG`, `ERROR`, `LOG`.
  - `CodaAgentEventMap`: Maps events to parameter signatures.

### `AnalyzeAgent` (extends `CodaAgent`)
- Gathers project information using specialized tools and LLM analysis.
- Main method: `analyze(path)`

### `AgentLogger`
- Listens for agent events, formats CLI log output.

---

## Main Tools

- **readDirectoryTreeTool**: Reads and returns formatted directory hierarchy (respects ignore files).
- **readFileTool**: Reads file contents as plain text.

---

## Frameworks & Dependencies

- **Runtime:** Bun (JS/TS runtime)
- **Core:** TypeScript, ESNext
- **LLM SDK:** `@openai/agents`, `openai`
- **CLI:** `@commander-js/extra-typings`
- **Formatting/Color:** `chalk`
- **Validation:** `zod`
- **Testing:** `bun:test`
- **Peer:** `commander`, `typescript`
- **Dev:** Prettier, sort-imports plugin, bun typings

---

## Example Output

Analysis results are written to `.coda/project-overview.md` in the analyzed directory.

---

## Tests

Tested with bun's built-in test runner (`bun test`). Includes tests for ASCII art, directory, and file tools.

---

## Extensibility

New tools can be created by following the `tool` interface from `@openai/agents` and plugging into the agent's tool array.

---

## Author

[Evan Tahler](mailto:evan@evantahler.com)

---

## License

MIT (see package.json)

---