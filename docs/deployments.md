# Deployment Pipeline

- PR previews are provided by the connected Vercel Git integration (verify the Preview deployment on each PR).
- Push to `main` triggers the staging workflow.
- Production is manually initiated via GitHub Actions **Staging and Production Deployments** workflow, and is gated by the GitHub `production` Environment approval rules.
- Vercel CLI deploys use repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
- Releases are blocked until a verified `scripts/migrate.sh` migration runner is implemented. No migration framework was found in the inspected repository. Do not add an empty/no-op migration runner to bypass this gate.
- Rollback procedure: [docs/runbooks/rollback.md](docs/runbooks/rollback.md).

## Required setup
1. Add the three Vercel secrets to GitHub Actions.
2. Create GitHub Environment `staging` and configure staging secrets as needed.
3. Create GitHub Environment `production`; configure required reviewers and prevent self-approval where available.
4. Ensure Vercel project settings use the correct project/org IDs and deployment targets.
5. Implement and test the migration runner against the real database/backend before enabling release workflows.
6. Verify PR preview deployments in Vercel.
