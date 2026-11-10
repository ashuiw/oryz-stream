# Oryz production security checklist

1. Set production environment variables in the hosting provider, never commit `.env.local`.
2. Keep `TMDB_ACCESS_TOKEN` server-only. Never prefix it with `NEXT_PUBLIC_`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Configure Google OAuth in Google Cloud and Supabase with the production callback URL.
5. Run `npm ci` and `npm audit` in CI. Do not deploy with unresolved high/critical advisories.
6. Run `npm run build` before deployment.
7. Run the SQL in `supabase/schema.sql` in the production Supabase project.
8. Verify RLS is enabled on every user-data table and test cross-user access with two test accounts.
9. Use HTTPS only in production.
10. The included API rate limiter is intentionally lightweight and process-local. For multi-instance/serverless production, add a distributed rate limiter (for example Redis/Upstash or a provider-level WAF/rate limit) before high traffic.
11. Keep Supabase secret/service-role keys off the client and out of `NEXT_PUBLIC_*` variables.
12. Rotate any credential immediately if it was ever committed to Git or pasted publicly.
