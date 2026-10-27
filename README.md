# PRI-ANIME

PRI-ANIME is a React + Vite website deployed on Vercel.

## Run locally

1. Install Node.js (LTS).
2. Clone this repository.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   ```

## Deploy on Vercel

Connect this GitHub repository to the Vercel project. Use the default Vite settings:
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Vercel should automatically create a deployment when a commit is pushed to the connected branch.

## Important migration note

The Base44 Vite build plugin has been removed so it no longer injects build-time tooling or development notifications. Some existing features still import the Base44 SDK for authentication, stories, notifications, watch history, and library data. Those runtime features must be migrated to a replacement backend before the SDK and the `base44/` backend definitions can safely be deleted. The VidStuck player is separate from Base44 and has not been intentionally changed as part of this build-tool cleanup.
