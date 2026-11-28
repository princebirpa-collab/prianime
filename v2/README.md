# PRI-ANIME v2 foundation

Isolated Next.js App Router + TypeScript foundation for the v2 migration. This is deliberately isolated under `v2/` to avoid disrupting the existing Vite production app or VidStuck player.

## Setup

`cd v2 && npm install && npm run dev`

Copy `.env.example` to `.env.local` and configure Postgres before enabling database-backed features. Metadata discovery currently uses the public AniList GraphQL endpoint through server-side code only; no licensed video is bundled or scraped.

## Migration status

Foundation only: editorial shell, responsive navigation, theme tokens, starter browse/home route. Authentication, database schema migrations, moderation, uploads and licensed theatre integrations are staged for subsequent implementation and must not be represented as active until configured and tested.