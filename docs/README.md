# Documentation

This directory contains external API documentation and resources for the SubNet project.

## Subconscious API Documentation

The `subconscious/` folder contains comprehensive documentation for the Subconscious AI platform that powers SubNet's agent execution.

### Available Documentation

- **[introduction.md](subconscious/introduction.md)** - API basics, authentication, and endpoints
- **[overview.md](subconscious/overview.md)** - Platform overview and use cases
- **[mental-model.md](subconscious/mental-model.md)** - Development philosophy and approach
- **[using-subconscious.md](subconscious/using-subconscious.md)** - Complete API usage guide with code examples

### Official Documentation

Source: https://docs.subconscious.dev

### Key Concepts

**Subconscious** is an AI agent platform that provides:

- Tool use and long-horizon reasoning
- OpenAI-compatible API
- Structured reasoning and response format
- Production-ready agent execution

**Architecture**: Model + Runtime (TIM inference engines)

**Philosophy**: You provide goals and tools → Subconscious handles reasoning and orchestration

## Using This Documentation

The Cursor rules in `.cursor/rules/` reference these documentation files:

- **subconscious-api.mdc** - API integration patterns and best practices
- **agent-development.mdc** - Agent creation and management guidelines

These rules help Cursor understand how to work with the Subconscious API when developing SubNet features.

## Adding More Documentation

When adding new external API documentation:

1. Create a folder for the service (e.g., `docs/service-name/`)
2. Add markdown files with clear, structured content
3. Include source URLs at the top of each file
4. Create corresponding Cursor rules in `.cursor/rules/`
5. Reference the docs using `[filename](mdc:docs/service-name/filename.md)` syntax
6. Update this README

## Maintenance

- Keep documentation in sync with official sources
- Update when APIs change or new features are added
- Review quarterly for accuracy
