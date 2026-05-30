## X-Ample Development Website

Marketing site and content admin for **X-Ample Development** — a Discord bot and web development studio.

### What's included

- **Marketing pages** (home, services, portfolio, about, team, contact, support)
- **Blog** (MDX from repo via Decap CMS)
- **Content admin** (vacancies, portfolio, team, newsletter — Supabase-backed)
- **Contact form** and **newsletter signup** (Resend + Supabase)
- Deploy-ready for **Netlify**

### Local development

```bash
npm install
cp env.example .env.local   # fill in values
npm run dev
```

### Environment variables

See [`env.example`](env.example). Key values:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Vacancies, team, portfolio, newsletter |
| `RESEND_API_KEY` | Contact form + newsletter emails |
| `CONTACT_EMAIL` | Inbox for form submissions |
| `CONTENT_ADMIN_SECRET` | Password for `/admin/*` content tools |
| `NEXT_PUBLIC_CALENDLY_URL` | Optional “Book a call” button |
| `NEXT_PUBLIC_DISCORD_GUILD_ID` | Optional Discord embed widget on Support |

### Content admin

Set `CONTENT_ADMIN_SECRET` (min 8 characters), then sign in at `/admin/login`.

| Route | Manages |
|-------|---------|
| `/admin/vacancies` | Job listings (Supabase) |
| `/admin/portfolio` | Portfolio intro + projects (Supabase) |
| `/admin/team` | Team page intro + members (Supabase) |
| `/admin/newsletter` | Newsletter subscribers (Supabase `waitlist` table) |
| `/admin` (Decap) | Blog posts + JSON page content in git |

Apply schema from [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor before using admin features.

### Blog (Decap CMS)

- Admin UI: `/admin` (served from `public/admin/`)
- Posts: `content/blog/*.mdx`
- Requires GitHub OAuth via Netlify Functions (`oauth-begin`, `oauth-complete`)

### Public routes

`/`, `/services`, `/portfolio`, `/about`, `/team`, `/blog`, `/contact`, `/support`, `/vacancies`, `/privacy`, `/terms`
