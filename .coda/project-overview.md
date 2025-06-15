## Project Analysis: CODA

### Project Name

**CODA**

### Project Description

CODA is a local project summarizer and code analysis agent CLI. It is written in TypeScript, powered by Bun, and leverages the OpenAI Agents SDK. Its purpose is to rapidly analyze codebases and generate structured markdown overviews that can quickly orient humans or language models (LLMs) to the purpose, structure, and design of a project.

---

## Folder Structure

```
/Users/evan/workspace/coda
├── .coda/                # Output directory for project summaries
│   └── project-overview.md
├── .github/
│   └── workflows/        # GitHub Actions CI pipeline
│       └── test.yml
├── .vscode/              # Editor configs
├── agents/
│   └── analyze.ts        # The main analysis agent logic
├── assets/
│   └── ascii/            # ASCII art for CLI UX
│       ├── ascii.test.ts
│       ├── bot.confused.txt
│       ├── bot.happy.txt
│       ├── bot.sad.txt
│       └── index.test.ts
├── classes/
│   ├── codaAgent.ts      # Agent class and events
│   ├── config.ts         # Configuration loader/validator
│   ├── logger.test.ts
│   └── logger.ts         # CLI logger with colored output and spans
├── test/
│   └── mount/
├── tools/
│   ├── readDirectoryTree.test.ts
│   ├── readDirectoryTree.ts  # Tool: print directory structure
│   ├── readFile.test.ts
│   ├── readFile.ts       # Tool: read files as markdown code blocks
│   ├── writeFile.test.ts
│   └── writeFile.ts      # Tool: safe/sandboxed file writing
├── utils/
│   └── toolUtils.ts      # Helpers for tools, paths, output directory
├── .env.example
├── .gitignore
├── .prettierrc
├── bun.lockb
├── coda.ts               # CLI entry point
├── package.json
├── README.md
└── tsconfig.json
```

---

## Frameworks and Dependencies

- **Runtime:** [Bun](https://bun.sh/) (TypeScript-first runtime like Node)
- **Languages:** TypeScript
- **LLM SDK:** [`@openai/agents`](https://npmjs.com/package/@openai/agents)
- **CLI:** [`@commander-js/extra-typings`](https://npmjs.com/package/@commander-js/extra-typings)
- **Formatting:** `chalk` (colors), `ora` (spinners), `prettier`, and `@trivago/prettier-plugin-sort-imports`
- **Validation:** `zod`
- **Testing:** Bun's built-in test runner (`bun:test`)

#### From package.json

```json
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
```

---

## Main Components: Classes, Types, and Tools

### CLI Entrypoint (coda.ts)

- Uses Commander to define commands and their options.
- Presents usage info, project name, version, and ASCII art in help text.
- Main command: `analyze` — accepts directory, OpenAI config, logging control.
- Instantiates `Config`, `Logger`, and the core `AnalyzeAgent`.
- Runs analysis and exits:

```typescript
const agent = new AnalyzeAgent(config, logger);
await agent.analyze(config.directory);
```

---

### Analysis Agent (agents/analyze.ts)

- Defines `AnalyzeAgent`, which **extends CodaAgent**.
- Sets top-level LLM instructions: reads README/dev docs, infers dependencies, lists main entities, and writes a project overview markdown.
- Orchestrates the sequence: directory walk, file reads, and summary output.
- Exposes `analyze(projectPath: string)`:

```typescript
async analyze(projectPath: string) {
  this.logger.startSpan(`Analyzing project at ${projectPath}...`);
  const result = await this.run(
    `Analyze the following directory: ${projectPath} ...`
  );
  this.logger.endSpan(result.finalOutput);
}
```

---

### Abstract Agent Class (classes/codaAgent.ts)

- Defines `CodaAgent`, an abstract wrapper for agent invocations.
- Configures agent model, instructions, and tools via OpenAI Agents SDK.
- Handles LLM client setup per config.
- Exposes `.run(prompt)`:

```typescript
protected async run(prompt: string) {
  const result = await run(this.agent, prompt);
  if (result.finalOutput) {
    this.logger.debug(result.finalOutput);
  }
  return result;
}
```

#### Events

- `CodaAgentEvent` (`DEBUG`, `ERROR`, `LOG`) and event map for extensible hooks.

---

### Configuration and Logging

#### Config Loader (classes/config.ts)

- Reads OpenAI settings, log details, and target directory from CLI options or environment variables (via Bun).
- Validates presence of required args.
- Used throughout to propagate configuration.

#### Logger (classes/logger.ts)

- Provides colored, leveled output via `chalk` and spinner/progress displays with `ora`.
- Levels: DEBUG, INFO, WARN, ERROR.
- Methods:
  - `Logger.startSpan` (starts a CLI progress spinner for a long-running action)
  - `Logger.updateSpan` (updates spinner message)
  - `Logger.endSpan` (finishes span, outputs duration)
- Timestamps and coloring are configurable.

Example of logging:

```typescript
logger.info("Starting analysis...");
logger.startSpan("Reading directory...");
logger.updateSpan("Processing files...", "📁");
logger.endSpan("Complete!");
```

---

### Core Tools

#### Directory Tree Tool (tools/readDirectoryTree.ts)

- Prints directory structure (respects `.gitignore` and some hardcoded ignores).
- Used by agent to collect an overview.
- Main function:

```typescript
export async function execute(parameters) {
  const tree = getDirectoryTree(parameters.path);
  return `Directory tree for ${parameters.path}:\n${tree}`;
}
```

Ignores via `.gitignore` parsing and always ignored list.

#### File Read Tool (tools/readFile.ts)

- Reads the contents of a file and returns text as a markdown code block.
- Used by the agent to sample and summarize source files.

#### File Write Tool (tools/writeFile.ts)

- Writes markdown results to the `.coda/project-overview.md` summary location.
- **Files can only be written within the project directory.** Sandbox enforcement prevents leaking outside the analyzed project.

```typescript
if (!targetPath.startsWith(configDir)) {
  return `Error writing file: Cannot write outside configured directory ${configDir}`;
}
```

#### Tool Helpers (utils/toolUtils.ts)

- Ensures `.coda` output dir exists, provides full path helpers and wrappers for error-robust tool execution.
- Stdizes span/progress logging/reporting:

```typescript
logger.updateSpan(
  `executing tool \`${name}\` (${JSON.stringify(parmData)})`,
  "⏳",
);
```

---

## Typical Code Patterns

### CLI Entrypoint Pattern

```typescript
program
  .command("analyze")
  .description("Analyze a directory")
  .option("-d, --directory [directory]", ...)
  ...
  .action(async (options) => {
    const config = new Config(options);
    const logger = new Logger(config);
    const agent = new AnalyzeAgent(config, logger);
    await agent.analyze(config.directory);
    process.exit(0);
  });
program.parse();
```

**Usage:** Cleanly sets up CLI, loads config, logs output, and launches agent analysis loop.

---

### Abstract Agent Execution

```typescript
// codaAgent.ts
protected async run(prompt: string) {
  const result = await run(this.agent, prompt);
  if (result.finalOutput) {
    this.logger.debug(result.finalOutput);
  }
  return result;
}
```

**Usage:** Encapsulates agent LLM call and logging in a single promise.

---

### Pluggable Tool Design

Each tool implements an OpenAI-compatible interface, exposes its schema, description, and wiring. Execution is wrapped for logging and error handling.

**Example from ToolUtils:**

```typescript
static wrappedExecute<T extends z.ZodType, R>(
  name: string,
  execute: (parameters: z.infer<T>, config: Config) => Promise<R>,
  config: Config,
  logger: Logger
)
```

**Usage:** Standardizes calling a tool, logging parameters, handling errors, and reporting results.

---

## Tests

Mainly using `bun:test`:

**Example: assets/ascii/index.test.ts**

- Verifies ASCII art format and specific lines.
- E.g., It checks that the "happy bot" contains certain Unicode and border characters.

**Testing Focus Areas:**

- Directory/filename ignoring for directory tree.
- Sandboxing in file write tool (cannot write outside analyzed project).
- Logging correctness and coloring.
- Proper display of spinners/progress during tool execution.

---

## Summary

- **CODA** is a modern, Bun-powered CLI for codebase summarization and rapid codebase comprehension.
- Uses a pluggable, tool-based agent architecture—easy to extend with more tools.
- Sandboxed and parallel: ensures safe local operation and fast analysis of large projects.
- Logging and progress are well-considered for CLI UX.
- File analysis and output operations are robustly checked with tests.

---

## Summary of Accomplishments

- Inspected all critical code, config, and test files in the top 100 files of the repository.
- Extracted up-to-date package metadata, project structure, architecture, and design details.
- Summarized main agent, CLI, tool, and config classes, including extensibility and testing.
- Included typical code and test patterns for future LLM or developer reference.
- This outcome is documented as `/Users/evan/workspace/coda/.coda/project-overview.md` for LLM/bootstrap efficiency.

---

If you need further breakdowns of any particular file, class, or function, or want code samples for additional files just outside the first batch, please specify!
