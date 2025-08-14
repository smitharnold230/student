# Release Checklist

Before tagging a release, ensure all items below are completed.

## Pre-release Verification
- [ ] All tests passing (`npm test`)
- [ ] Coverage reviewed (CI artifact)
- [ ] OpenAPI up-to-date (`/api/docs`)
- [ ] Postman collection exported (`npm run postman:export`)
- [ ] Docker compose up works (`docker compose up --build`)
- [ ] ENV files set in prod
- [ ] DB migrations applied & reversible

## Security & Quality
- [ ] No secrets in code or logs
- [ ] Rate limiting active on auth routes
- [ ] Audit logging enabled
- [ ] Dependencies scanned for vulnerabilities

## Documentation
- [ ] README updated with latest setup instructions
- [ ] API documentation reflects current endpoints
- [ ] CHANGELOG.md updated with release notes

## Deployment
- [ ] Production environment variables configured
- [ ] Database backup completed
- [ ] Health check endpoints responding
- [ ] Rollback plan documented

## Final Steps
- [ ] Run `npm run done` to verify all checks pass
- [ ] Tag release with semantic versioning
- [ ] Deploy to staging first
- [ ] Monitor for 24 hours before production
