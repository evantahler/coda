# CODA

A local coding agent written in TypeScript, using Bun and the OpenAI Agents SDK.

## Features

- Fast. Parallel execution of tasks with Bun.
- Local. No cloud dependencies.
- Flexible. Can use any LLM API.
- Extensible. Easily add new tools.
- Safe. All code is run in a fully isolated container.

## Configuration

Coda can be configured with the following environment variables:

- `OPENAI_API_KEY`: The OpenAI API key.
- `OPENAI_BASE_URL`: The OpenAI base URL.
- `OPENAI_MODEL`: The OpenAI model.

Yes, you can use a `.env` file to set these variables, and yes, you can use the CLI flags to override them too. Setting values from OpenAI and Anthropic is supported!

## Usage
