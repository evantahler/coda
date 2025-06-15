# CODA

A local project summarizer and code analysis agent CLI. Written in TypeScript, powered by Bun and the OpenAI Agents SDK. Coda efficiently examines codebases and produces concise markdown overviews for rapid understanding by humans or LLMs.

---

## Overview

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
- **LLM SDK:** `@openai/agents`
- **CLI:** `@commander-js/extra-typings`, `commander` (peer dep)
- **Formatting:** `chalk`, `ora`, `prettier`, `@trivago/prettier-plugin-sort-imports`
- **Validation:** `zod`
- **Testing:** `bun:test`

### `package.json` dependencies

<details>
<summary>Show dependencies</summary>

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

</details>

---

## Main Classes, Types, and Modules

| File / Class                 | Description                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `coda.ts`                    | CLI entry; parses args, boots analysis agent                                                           |
| `agents/analyze.ts`          | `AnalyzeAgent` — inherits from `CodaAgent`, orchestrates reading/summarizing/writing project overview  |
| `classes/codaAgent.ts`       | `CodaAgent` (abstract) — core agent class; wraps OpenAI Agents SDK, exposes `run()`; event enums/types |
| `classes/config.ts`          | `Config` — loads/validates CLI/environment options, configures agent run                               |
| `classes/logger.ts`          | `Logger` — structured/colorful CLI output, spans, log levels                                           |
| `tools/readDirectoryTree.ts` | `readDirectoryTreeTool` — prints directory structure as a tree, respects `.gitignore`                  |
| `tools/readFile.ts`          | `readFileTool` — reads file as markdown code block                                                     |
| `tools/writeFile.ts`         | `writeFileTool` — writes string to a target file                                                       |
| `utils/toolUtils.ts`         | `ToolUtils` — tool/task helpers, output writing, path helpers, tool wrapping                           |

### Key Classes & Enums

- `CodaAgentEvent` (DEBUG, ERROR, LOG)
- `CodaAgentEventMap` (typed event map)
- `LogLevel` enum (`DEBUG`, `INFO`, `WARN`, `ERROR`)
- `Config` (agent run configuration validation)
- `Logger` (pretty, spanned logging)
- `AnalyzeAgent` (main orchestrator for project summarization)
- Various "tool" interfaces for read/write file/tree

### Main Methods and Responsibilities

- **Config**: parses CLI/env options, sets runtime flags
- **Logger**: pretty color output, spans, log level control
- **CodaAgent.run(prompt)**: runs LLM agent on a prompt, applies tools
- **AnalyzeAgent.analyze(path)**: main workflow: scans directory, reads files, triggers project overview rendering
- **readDirectoryTreeTool/readFileTool/writeFileTool**: pluggable tool interfaces for file/directory IO
- **ToolUtils**: manages .coda directory persistence, tool wrapping, progress indication

---

## Interfaces, Types, Enums, Constants

- Event system for debugging/logging agent internals
- CLI/config/environment blending for agent options
- Zod used for input validation of tool parameters
- Reusable logger/spinner
- Bun dockerization for sandboxed `writeFile` actions

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
```

---

## Notable Logic Details

- **Directory tree and file IO**: honors `.gitignore` and common exclusions via pluggable tool
- **Sandboxed writing**: `writeFile.ts` leverages `docker`+Alpine for isolated writes (default, can adjust later for security)
- **Extensible tool system**: New tools can be defined and registered to agents as OpenAI LLM-compatible tools
- **Testing**: Uses `bun:test` with stub/configurable logger for tests

---

## Author & License

Evan Tahler <evan@evantahler.com> — MIT Licensed (see package.json)

---

## Summary of Accomplishments

- Examined the key files in the project and developer docs (README, configuration, utility classes, agent/core, tools)
- Aggregated class hierarchies, event systems, types, config flows, and dependencies/frameworks
- Detailed key logic, interfaces, methods, and extensibility in each main component
- Produced a markdown overview for both developer onboarding and LLM consumption
