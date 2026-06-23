# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- [pnpm](https://pnpm.io) 9 or later
- [Docker](https://www.docker.com) (for the local Supabase instance)

## Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/DevDogs-UGA/DevDogs-Website.git
   cd DevDogs-Website
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the local Supabase instance and dev server**

   ```bash
   pnpm dev
   ```

   This starts Supabase locally, runs database migrations, and launches the Next.js dev server at `http://localhost:3000`.

## Remote Supabase (optional)

By default, `pnpm dev` runs against a local Supabase instance via Docker. To
connect to a remote/cloud Supabase project instead (e.g. no Docker, or
testing against shared data):

1. **Copy the remote env template**

   ```bash
   cp .env.remote.example .env.remote
   ```

2. **Fill in `.env.remote`** with credentials from the target project's
   [Supabase dashboard](https://supabase.com/dashboard) (Project Settings >
   API, Database, and Storage > S3 Connection). See `.env.remote.example`
   for details on each variable.

   > **Note:** For `DB_URL`, copy the **Session pooler** connection string,
   > not the Transaction pooler (the dashboard's default). The transaction
   > pooler doesn't support the prepared statements `drizzle-kit` uses and
   > will cause `pnpm db:push:remote` to hang indefinitely.

3. **Run the dev server against the remote project**

   ```bash
   pnpm dev:remote
   ```

   This skips Docker/local Supabase and does not push any schema changes —
   it just points the dev server at the remote project.

`.env.remote` is gitignored — never commit it. Use `pnpm dev` to go back to
the default local workflow.

## Local docs preview

To preview documentation changes before pushing:

```bash
pnpm docs:preview
```

Then visit `/tools/testing/docs` on the running dev server. The page auto-refreshes when you save any file in `docs/`, and renders identically to the live docs site.
