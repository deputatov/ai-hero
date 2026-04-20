# Gemini Project Context: ai-app-template (DeepSearch Day 1)

## Project Overview
This project is a high-performance deep search application prototype built during "Day 1" of the DeepSearch course. It leverages the latest web technologies to provide an AI-driven search and chat experience.

- **Primary Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **AI Engine:** Vercel AI SDK (`ai`) integrated with OpenRouter (defaulting to `anthropic/claude-3-5-haiku`).
- **Data & Persistence:** PostgreSQL via Drizzle ORM, with NextAuth.js (v5 beta) for authentication.
- **Performance & Caching:** Redis (ioredis) is used for caching external API calls (e.g., search results) to minimize latency and costs.
- **External Integrations:** Serper API for Google search functionality.

## Architecture & Directory Structure
The project follows a modern Next.js structure with a focus on type safety and separation of concerns:

- `src/app/`: Next.js App Router pages and API routes.
  - `api/chat/route.ts`: Core streaming endpoint for AI interactions.
- `src/components/`: Reusable UI components (Auth, Chat, etc.).
- `src/server/`: Server-only logic, including database schema, authentication configuration, and Redis client.
- `src/env.js`: Centralized, type-safe environment variable management using `@t3-oss/env-nextjs`.
- `src/model.ts`: AI model configuration and initialization.
- `src/serper.ts`: Logic for interfacing with the Serper search API.
- `drizzle/`: Database migrations and metadata.

## Building and Running

### Prerequisites
- [Node.js](https://nodejs.org/) (managed via `.nvmrc`)
- [pnpm](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local database and Redis)

### Setup Commands
1. **Install Dependencies:**
   ```bash
   pnpm install
   ```
2. **Infrastructure:**
   ```bash
   ./start-database.sh  # Starts Postgres container
   ./start-redis.sh     # Starts Redis container
   ```
3. **Database Migration:**
   ```bash
   pnpm db:push         # Synchronize schema with the database
   ```
4. **Development Server:**
   ```bash
   pnpm dev             # Runs Next.js in development mode
   ```

### Quality & Tools
- **Type-check & Lint:** `pnpm check` (runs `next lint` and `tsc --noEmit`)
- **Format:** `pnpm format:write` (uses Prettier)
- **Database Studio:** `pnpm db:studio` (visual DB explorer)
- **Tests:** `vitest` is configured (run via `pnpm vitest` or similar).

## Development Conventions & Insights
- **AI SDK Updates:** The `ai-sdk` library evolves rapidly. When modifying logic in `src/app/api/chat/route.ts` or using tools/streaming features, **always** refer to the latest documentation and changes at [https://context7.com/websites/ai-sdk_dev](https://context7.com/websites/ai-sdk_dev) using the `web_fetch` tool to ensure compliance with the newest patterns.
- **Type Safety:** Always use Zod for validation, especially for environment variables (`src/env.js`) and API payloads.
- **Environment Variables:** Define new keys in `src/env.js` to ensure they are validated at runtime. Required keys include `OPENROUTER_API_KEY`, `DATABASE_URL`, and `REDIS_URL`.
- **Database Patterns:** Drizzle ORM is used with a multi-project schema prefix (`ai-app-template_`). Prefer storing complex AI message states as JSON blobs where appropriate, but be mindful of schema dependencies.
- **AI Streaming:** Use the Vercel AI SDK's `streamText` for LLM interactions.
- **Caching Strategy:** Cache expensive external calls (like Serper search) in Redis to improve performance and avoid API rate limits.
- **Observation Log:** Refer to `observations.md` for ongoing architectural decisions, trade-offs (e.g., RAG vs. direct context), and planned workflows.

## External Resources & References
- **AI-SDK Documentation:** [https://context7.com/websites/ai-sdk_dev/llms.txt?tokens=10000](https://context7.com/websites/ai-sdk_dev/llms.txt?tokens=10000) - Use this as the primary source of truth for `ai` and `@ai-sdk/*` libraries.
