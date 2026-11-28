# Rollback Runbook

## Vercel deployment rollback
1. Open the Vercel project dashboard and select **Deployments**.
2. Locate the last known-good production deployment and inspect its build and runtime logs.
3. Use the deployment's **Promote/Alias to Production** action (or the dashboard rollback control available for that deployment) to restore traffic. Confirm the production domain resolves to the selected deployment.
4. Verify critical pages, authentication, catalog/search, and the watch page. Review runtime logs and health checks.
5. Record the rollback, deployment URL, commit SHA, and incident details.

## Database safety
- This repository currently has no verified migration framework. Deployments intentionally block until `scripts/migrate.sh` exists and is configured.
- Use forward-compatible (expand/contract) migrations: add before consuming, avoid destructive changes until all old code is retired.
- Do not automatically reverse destructive migrations during application rollback. Restore data from a verified backup or execute a reviewed recovery procedure.
- Migration failures must stop the release before Vercel deployment.
- Verify backup restoration procedures in a non-production environment before relying on them.

## Git rollback
Prefer a revert commit and normal CI/staging flow for code changes. Avoid force-pushing to `main`.
