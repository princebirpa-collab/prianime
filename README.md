# PRI-ANIME

PRI-ANIME is a React + Vite website deployed on Vercel.

## Run locally

1. Install Node.js (LTS).
2. Clone this repository.
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Build for production: `npm run build`

## Deploy on Vercel

Connect this GitHub repository to the Vercel project. Use:
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Vercel can automatically create deployments when a commit is pushed to the connected branch.

## Migration status

The Base44 Vite build plugin and its development-time notifications have been removed. Some existing runtime features still use the Base44 SDK (authentication, stories, notifications, video catalogue, and watch-history storage). These require a replacement backend before removing the SDK and the `base44/` definitions safely; deleting them before migrating would break those features. The VidStuck player is separate and was not intentionally changed in this cleanup.
