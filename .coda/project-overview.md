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

---

## Main Classes, Types, and Modules

| File / Class         | Description |
|---------------------|-------------|
|`coda.ts`            | CLI entry; parses args, boots analysis agent  |
|`agents/analyze.ts`  | `AnalyzeAgent` — inherits from `CodaAgent`, orchestrates reading/summarizing/writing project overview |
|`classes/codaAgent.ts` | `CodaAgent` (abstract) — core agent class; wraps OpenAI Agents SDK, exposes `run()`; event enums/types |
|`classes/config.ts`  | `Config` — loads/validates CLI/environment options, configures agent run |
|`classes/logger.ts`  | `Logger` — structured/colorful CLI output, spans, log levels |
|`tools/readDirectoryTree.ts` | `readDirectoryTreeTool` — prints directory structure as a tree, respects `.gitignore` |
|`tools/readFile.ts`  | `readFileTool` — reads file as markdown code block |
|`tools/writeFile.ts` | `writeFileTool` — writes string to a target file |
|`utils/toolUtils.ts` | `ToolUtils` — tool/task helpers, output writing, path helpers, tool wrapping  |

Classes & Enums:
- `CodaAgentEvent` (DEBUG, ERROR, LOG)
- `CodaAgentEventMap` (typed event map)
- `LogLevel` enum (`DEBUG`, `INFO`, `WARN`, `ERROR`)

---

## Core Variables & Methods
- `agent`, `name`, `instructions`, `tools`, `config`, `logger` (in core agent)
- `run(prompt)` — runs agent with prompt, logs output
- `analyze(path)` — on `AnalyzeAgent`, orchestrates full project summarization

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

## Author & License
Evan Tahler <evan@evantahler.com> — MIT Licensed (see package.json)

---

## Summary of Accomplishments
- Examined the project directory and prioritized key files (README, main classes, agent, tools, utils, config)
- Aggregated core classes, enums, variables, main logic flows, and dependencies/frameworks
- Produced a complete, compact project markdown overview for rapid reuse (by developers or LLMs)
