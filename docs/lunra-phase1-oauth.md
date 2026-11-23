# LUNRA Phase 1: Discord OAuth foundation

This repository currently uses Vite + React. OAuth is a Vercel Node serverless function at `/api/discord`.

## Routes
- `GET /api/discord?action=login`: Discord authorization redirect, scopes identify/email, signed state cookie.
- `GET /api/discord?action=callback`: state validation, server-side code exchange, user identity fetch, signed HTTP-only session cookie.
- `GET /api/discord?action=me`: session identity or 401.
- `GET /api/discord?action=logout`: clears session cookie.

## Setup
1. Create a Discord Developer Portal OAuth application and add the redirect URI exactly: `https://YOUR_DOMAIN/api/discord?action=callback`.
2. Add `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, and `LUNRA_SESSION_SECRET` in Vercel environment variables.
3. Use a long random session secret. Never commit credentials.
4. Redeploy after adding variables.

## Scope/limitations
This starter uses signed stateless cookies and does not persist profile data to PostgreSQL. OAuth access tokens are not stored. Profile customization, DB persistence, account deletion and refresh/revocation are not implemented by this scaffold and require further work. This is not the complete Phase 1.