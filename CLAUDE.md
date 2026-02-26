# Chess Game Review App — CLAUDE.md

## Project Overview

A web app that lets users import chess games from Chess.com (or paste PGN directly), then submit those games to Lichess for analysis. The app displays the resulting Lichess analysis board — either embedded via iframe or linked directly.

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Language:** TypeScript throughout (strict mode)
- **Styling:** TBD (default to Tailwind CSS unless otherwise specified)
- **Package manager:** npm (default) — update this if changed

## Core User Flow

1. User enters a Chess.com username **or** pastes a PGN directly
2. App fetches games from Chess.com Public API (returns PGN)
3. PGN is submitted to Lichess via the `gameImport` endpoint
4. Lichess returns a game URL (e.g. `https://lichess.org/abc123`)
5. App displays the analysis board — embedded as `https://lichess.org/embed/game/abc123` or linked

## Key Integrations

### Chess.com Public API
- Base URL: `https://api.chess.com/pub`
- No auth required for public endpoints
- Postman collection: `https://www.chess.com/postman/collection-dev.json`
  - Keep a copy in `/postman/chess-com-api.json` for easy local reference
- Key endpoint: `GET /player/{username}/games/{year}/{month}` — returns games including PGN

### Lichess API — Game Import
- SDK: [`equine`](https://github.com/devjiwonchoi/equine) (Lichess TypeScript SDK)
- Method: `gameImport(options)` — POST to `/api/import`
- Auth: Bearer token (OAuth). Limits: 200 games/hr authenticated, 100/hr anonymous
- Content-Type: `application/x-www-form-urlencoded`
- Returns a Lichess game URL used to build the analysis/embed link

### Lichess Analysis Board Embedding
- After import, convert the game URL to an embed URL:
  - Game URL: `https://lichess.org/{gameId}`
  - Embed URL: `https://lichess.org/embed/game/{gameId}?theme=auto&bg=auto`
- Use an `<iframe>` with `allowfullscreen` for in-app embedding
- Fall back to a direct link if embedding is blocked

## Project Structure (target)

```
/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home — game import form
│   └── review/[id]/      # Analysis board page
├── lib/
│   ├── chess-com.ts      # Chess.com API client
│   └── lichess.ts        # Lichess gameImport wrapper
├── components/
│   └── AnalysisBoard.tsx # Iframe embed or link component
├── postman/
│   └── chess-com-api.json # Chess.com Postman collection (local copy)
└── types/
    └── index.ts          # Shared TypeScript types
```

## Development Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
npm run type-check # tsc --noEmit
```

## Environment Variables

```
LICHESS_API_TOKEN=   # OAuth token for Lichess game import (optional for anon use)
```

Store in `.env.local` (never commit).

## Coding Conventions

- Use `async/await` over `.then()` chains
- Colocate API fetch logic in `lib/` — keep components thin
- Prefer named exports over default exports for utilities
- Type API responses explicitly — avoid `any`
- Handle Chess.com and Lichess rate limits gracefully (show user-friendly errors)
