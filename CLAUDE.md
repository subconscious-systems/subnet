# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SubNet is a Next.js application for creating and managing AI agents powered by the Subconscious API. Users can create agents with custom prompts and tools, discover existing agents, and run them in the browser with streaming responses.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Linting
pnpm lint

# Formatting
pnpm format        # Format all files
pnpm format:check  # Check formatting without changes

# Database operations
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database with sample agents
```

## Environment Setup

Required environment variables (create `.env` file):
- `SUBCONSCIOUS_API_KEY` - API key for Subconscious API
- `DATABASE_URL` - PostgreSQL connection string (recommended: Neon free tier)

## Architecture

### Database Layer (`/db`)

Uses Drizzle ORM with PostgreSQL. Single table schema:

**agents table** (`db/schema.ts`):
- `id` (integer, auto-increment primary key)
- `name` (varchar) - Agent display name
- `description` (text) - Human-readable description
- `prompt` (text) - System prompt/instructions for the agent
- `tools` (jsonb) - Array of tool identifiers

**Field Mapping**: The database uses `name` field but the API layer maps it to `title` in the Agent interface for consistency with the frontend.

### API Routes (`/app/api/agents`)

REST API for agent CRUD operations and execution:

- `GET /api/agents` - List first 50 agents (ordered by ID desc)
- `POST /api/agents` - Create new agent
- `GET /api/agents/[id]` - Get specific agent
- `DELETE /api/agents/[id]` - Delete agent
- `POST /api/agents/[id]/run` - Execute agent with streaming response

**Agent Execution Flow** (`app/api/agents/[id]/run/route.ts`):
1. Fetches agent from database by ID
2. Maps tools array to Subconscious API format (`{ type: tool_name }`)
3. Calls Subconscious API with OpenAI-compatible client:
   - Base URL: `https://api.subconscious.dev/v1`
   - Model: `tim-large`
   - Stream enabled for real-time responses
4. Returns streaming response using ReadableStream

### Available Tools

Defined in `lib/types.ts` as `AVAILABLE_TOOLS`:
- `parallel_search` - Parallel Search
- `exa_search` - Exa Search
- `exa_crawl` - Exa Crawl
- `exa_find_similar` - Exa Find Similar
- `web_search` - Google Web Search
- `webpage_understanding` - Jina Webpage Understanding

### Frontend Pages

- `/` (`app/page.tsx`) - Agent discovery/listing page
- `/create` (`app/create/page.tsx`) - Agent creation form
- `/run/[id]` (`app/run/[id]/page.tsx`) - Agent execution interface

All pages are client-side rendered (`'use client'`).

### UI Components

Built with Radix UI primitives and Tailwind CSS. Comprehensive shadcn/ui component library in `/components/ui`. Custom components:
- `AgentCard` - Displays agent info with delete functionality
- `Header` - Navigation header
- `Footer` - Site footer

Theme support via `next-themes` with `ThemeProvider`.

## Key Implementation Details

- **Next.js 15** with App Router
- **React 19** with client-side rendering for interactive pages
- **Drizzle ORM** for type-safe database queries
- **OpenAI SDK** configured for Subconscious API compatibility
- **Streaming Responses**: Agent execution uses ReadableStream for real-time output
- **TypeScript** throughout with strict typing
