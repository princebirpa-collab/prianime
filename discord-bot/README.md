# PRI-ANIME Discord Core

A new, independent Discord.js v14 bot for the PRI-ANIME community. It does not depend on RISKORA BOT and does not modify or remove any existing bots.

## Modules

- Welcome messages and onboarding
- Idempotent channel/category setup via `/setup`
- Community XP and leaderboard
- Moderation utilities and mod-log routing
- Private support ticket creation
- Optional AI chat integration (disabled unless an API key is configured)

All features run through one bot application with separate modules and channel routing. This avoids requiring five separate bot tokens while keeping each function in its own channel.

## Required environment

Copy `.env.example` to `.env` and fill in the values locally. Never commit `.env` or share the bot token in chat.

- `DISCORD_TOKEN`: token from the Discord Developer Portal
- `DISCORD_CLIENT_ID`: application ID
- `DISCORD_GUILD_ID`: PRI-ANIME server ID

In the Discord Developer Portal, enable the **Server Members Intent** and **Message Content Intent** for this bot. These are used for welcome events and message-based XP. Keep the bot token only in your host's secret environment settings.
- `OPENAI_API_KEY`: optional; only needed for AI replies

## Discord permissions

Invite the bot with the scopes `bot` and `applications.commands`. Grant only:
- View Channels
- Send Messages
- Read Message History
- Embed Links
- Manage Channels (for `/setup` and tickets)
- Manage Roles only if you later enable automatic milestone roles

Do not grant Administrator.

## Local run

```bash
npm install
npm run register-commands
npm start
```

## First-time setup

1. Invite the bot to PRI-ANIME.
2. Run `/setup` as a server administrator. It creates missing categories/channels and leaves existing channels untouched.
3. Set the welcome channel to `#welcome`; messages are routed to their dedicated channels.
4. Configure hosting with the same environment variables and keep the process running.

## Current status

The source includes setup, welcome, XP/leaderboard, private tickets, message purge and member timeout commands. It is not yet connected to Discord or deployed. Deployment requires a Discord application created by the server owner, the bot invited to the guild, and secrets configured in a persistent Node.js host. This bot is separate from RISKORA BOT.

AI chat is not implemented yet; the optional key is reserved for a later provider integration. Do not assume an AI response feature is active.
