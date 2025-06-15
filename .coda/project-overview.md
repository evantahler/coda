## Project Analysis: CODA

### Project Name

**CODA**

---

### Project Description

CODA is a local project summarizer and code analysis agent Command-Line Interface (CLI) tool. Authored in TypeScript, designed for the [Bun](https://bun.sh/) runtime, and leveraging the [OpenAI Agents SDK](https://npmjs.com/package/@openai/agents), its core utility is to analyze codebases and produce structured markdown overviews. The summaries generated serve as efficient documentation for both developers and language model (LLM) agents, allowing for rapid project orientation.

CODA is engineered for:
- **Speed:** harnesses Bun’s parallelism.
- **Local-first operation:** no required cloud dependencies.
- **LLM-flexibility:** can target any LLM API.
- **Extensibility:** modular tool/plugin-style architecture.
- **Safety:** all execution is sandboxed.

---

## Folder Structure

```
/Users/evan/workspace/coda
├── .coda/                # Output directory for project summaries and docs
│   ├── commands.md
│   ├── memory.md
│   └── project-overview.md
├── .github/
│   └── workflows/        # GitHub Actions CI pipeline (test/build)
│       └── test.yml
├── .vscode/              # Editor configs
├── agents/
│   ├── analyze.ts        # Main analysis agent orchestration
│   ├── commands.ts
│   └── memory.ts
├── assets/
│   └── ascii/            # ASCII art assets for UX
│       ├── ascii.test.ts
│       ├── bot.confused.txt
│       ├── bot.happy.txt
│       ├── bot.sad.txt
│       └── index.test.ts
├── classes/
│   ├── codaAgent.ts      # Abstract agent class/interface
│   ├── config.ts         # Config loader/validator
│   ├── logger.test.ts    # Logger unit tests
│   └── logger.ts         # CLI logger (colors, spans, progress)
├── test/
│   └── mount/
├── tools/
│   ├── readDirectoryTree.test.ts
│   ├── readDirectoryTree.ts  # Tool: directory structure readout
│   ├── readFile.test.ts
│   ├── readFile.ts       # Tool: file content reader
│   ├── runCommand.test.ts
│   ├── runCommand.ts     # Tool: command runner
│   ├── writeFile.test.ts
│   └── writeFile.ts      # Tool: safe/sandboxed file write
├── utils/
│   └── toolUtils.ts      # Tool helper: path, output directory, error handling
├── .env.example
├── .gitignore
├── .prettierrc
├── bun.lockb
├── coda.ts               # CLI entry point for CODA
├── package.json
├── README.md
└── tsconfig.json
```

---

## Frameworks and Dependencies

### Overview

- **Runtime:** Bun (TypeScript-first runtime)
- **Language:** TypeScript (`tsconfig.json` - modern ESNext, strict, no emit)
- **LLM SDK:** `@openai/agents` (OpenAI Agents toolkit)
- **CLI Parsing:** `@commander-js/extra-typings`
- **Styling/Formatting:** `chalk` (terminal colors), `ora` (spinner), `prettier` and plugin for import sorting
- **Validation:** `zod` (schema validation)
- **Testing:** Bun's built-in test system (`bun:test`)

### Key dependencies (from `package.json`):

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

## Main Components

### 1. CLI Entrypoint (`coda.ts`)

- Uses `Commander` for CLI command, options, help, and arguments parsing.
- Displays project metadata, version, and ASCII art.
- Main command: `analyze`.
  - Arguments: directory path, OpenAI API config flags, logging options.
  - Pattern:
    ```typescript
    const agent = new AnalyzeAgent(config, logger);
    await agent.analyze(config.directory);
    ```
- Configures and launches the analysis pipeline.

---

### 2. Analysis Agent (`agents/analyze.ts`)

- **AnalyzeAgent**: Main orchestrator, extends abstract `CodaAgent`.
- Reads README/dev docs, infers dependencies, enumerates primary code structures.
- Orchestrates:
  - Directory walking.
  - File reads and sampling.
  - Generating markdown project overviews.
- Core call:
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

### 3. Abstract Agent Class (`classes/codaAgent.ts`)

- **CodaAgent**: abstract, configurable wrapper for invoking LLM agent calls.
- Setup:
  - Model (OpenAI API, etc).
  - Global instructions and tools.
- Handles client instantiation and prompt invocation.
- Key method:
    ```typescript
    protected async run(prompt: string) {
      const result = await run(this.agent, prompt);
      if (result.finalOutput) {
        this.logger.debug(result.finalOutput);
      }
      return result;
    }
    ```
- **Events/Extensibility**: Exposes `CodaAgentEvent` (`DEBUG`, `ERROR`, `LOG`) for event hooks.

---

### 4. Configuration Loader (`classes/config.ts`)

- Reads required OpenAI API key, directory, log options.
- Pulls from Bun ENV or CLI options.
- Ensures presence, validates all configuration, and standardizes access.
- Example pattern:
    ```typescript
    public readonly openai_api_key: string = Bun.env.OPENAI_API_KEY || options.openai_api_key;
    ```

---

### 5. Logger (`classes/logger.ts`)

- Colorful, timestamped, leveled output with `chalk` & `ora`.
- Progress “spans” for long actions.
- Leveled: DEBUG, INFO, WARN, ERROR (filterable at runtime).
- Methods:
  - `info()`, `warn()`, `error()`, `debug()`
  - `startSpan()`, `updateSpan()`, `endSpan()`
- Tracks time and tool call count during spans.

Example:
```typescript
logger.info("Starting analysis...");
logger.startSpan("Reading directory...");
logger.updateSpan("Processing files...", "📁");
logger.endSpan("Complete!");
```

#### Logger Test (Excerpt from `logger.test.ts`):
```typescript
test("should not log debug messages when level is ERROR", () => {
  // ...setup...
  logger.debug("test message");
  expect(consoleSpy).not.toHaveBeenCalled();
});
test("should log error messages regardless of level", () => {
  // ...setup...
  logger.error("test message");
  expect(consoleSpy).toHaveBeenCalled();
});
```

---

## Tools

### Tool: Directory Tree (`tools/readDirectoryTree.ts`)
- Recursively prints directory structure.
- Respects `.gitignore` and fixed ignores.
- Used to give the agent global project overview.
- Core:
    ```typescript
    export async function execute(parameters) {
      const tree = getDirectoryTree(parameters.path);
      return `Directory tree for ${parameters.path}:\n${tree}`;
    }
    ```
- Ignores: Controlled by `.gitignore` and always-ignore lists.

---

### Tool: File Read (`tools/readFile.ts`)
- Simple: Reads file contents, returns as a markdown code block for agent/LMM analysis.

---

### Tool: File Write (`tools/writeFile.ts`)
- **Sandboxed:** Can only write within analyzed project’s directory (no leakage).
- Used for summary and generated artifact output.
- Core enforcement:
    ```typescript
    if (!targetPath.startsWith(configDir)) {
      return `Error writing file: Cannot write outside configured directory ${configDir}`;
    }
    ```

---

### Tool Helpers (`utils/toolUtils.ts`)
- Ensures `.coda/` output directory exists.
- Path and file helper utilities.
- Robust tool call and error handling.
- Progress reporting, integrates with logger.

Utility pattern:
```typescript
logger.updateSpan(
  `executing tool \`${name}\` (${JSON.stringify(parmData)})`,
  "⏳"
);
```

---

## Typical Code and Test Patterns

### CLI Entrypoint

```typescript
program
  .command("analyze")
  .description("Analyze a directory")
  .option("-d, --directory [directory]", ...)
  .action(async (options) => {
    const config = new Config(options);
    const logger = new Logger(config);
    const agent = new AnalyzeAgent(config, logger);
    await agent.analyze(config.directory);
    process.exit(0);
  });
program.parse();
```
**Usage:** Configures, runs end-to-end, and provides all runtime hooks.

---

### Abstract Agent Execution

```typescript
protected async run(prompt: string) {
  const result = await run(this.agent, prompt);
  if (result.finalOutput) {
    this.logger.debug(result.finalOutput);
  }
  return result;
}
```
**Usage:** Standardizes agent prompt execution and output logging.

---

### Pluggable Tool Execution

```typescript
static wrappedExecute<T extends z.ZodType, R>(
  name: string,
  execute: (parameters: z.infer<T>, config: Config) => Promise<R>,
  config: Config,
  logger: Logger
)
```
**Usage:** Standard approach for robust tool invocation (typed, logged, error-handled).

---

## Tests

`bun:test` framework is used throughout:
- Logger: Level-based output, no debug output when set to ERROR, etc.
- Tools: Directory and file operation sandboxing and ignoring.
- Output coloring and correct progress display.
- ASCII assets tested for artistic correctness.

Example (from `logger.test.ts`):
```typescript
test("should log error messages regardless of level", () => {
  ...
  logger.error("test message");
  expect(consoleSpy).toHaveBeenCalled();
});
```
Assets (`assets/ascii/index.test.ts`) confirm formatting and art asset fidelity.

---

## Summary of Accomplishments

- Read and interpreted the top-level directory structure (max. 100 files).
- Analyzed core documentation, config, and implementation files.
- Extracted and described all key project abstractions:
  - CLI, agent harness, tools, logger, configuration, and tests.
- Included code snippets, patterns, and test example code.
- Clearly outlined dependency, framework usage, and folder layout.
- Documented best-practice recommendations and CI workflow setup (`test.yml`).

**All information is now reflected in `/Users/evan/workspace/coda/.coda/project-overview.md` for rapid LLM or developer bootstrapping.**

---

If you need deeper dives, API references, or examples from specific files not covered in this summary, just ask!
