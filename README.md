## X-Ample Development Website

Full-stack Next.js site for **X-Ample Development / X-Ample Studios** with:

- **Marketing pages** (CMS-editable)
- **Blog** (MDX from repo)
- **Tebex store integration** (Headless API, server-side only)
- **User dashboard** (FiveM login → purchases, tickets, profile settings, admin)
- Deploy-ready for **Netlify**

### Local development

- Install deps:

```bash
npm install
```

- Copy env vars (see `env.example`) into your local env (e.g. `.env.local`) and fill them in.

- Run dev server:

```bash
npm run dev
```

### Required environment variables

- **`TEBEX_WEBSTORE_TOKEN`**: used in `https://headless.tebex.io/api/accounts/{token}/...`
- **`TEBEX_PUBLIC_TOKEN`**: Tebex Headless API Basic Auth username
- **`TEBEX_PRIVATE_KEY`**: Tebex Headless API Basic Auth password (server-only)
- **`SITE_URL`**: used to form Tebex basket `complete_url` / `cancel_url` (production: `https://x-ampledevelopment.co.uk`)

### Dashboard setup (Supabase)

The dashboard lives under `/dashboard/*` and is protected by an HttpOnly session cookie created after the Tebex/FiveM auth redirect.

1) Create a Supabase project and apply the schema:

- Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

2) Set env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `SESSION_SECRET` (long random string)
- `ADMIN_ALLOWLIST` (comma-separated Tebex customer ids)

3) Configure Tebex webhook (recommended for purchases):

- Create a webhook endpoint in Tebex pointing at `/api/tebex/webhook`
- Set `TEBEX_WEBHOOK_SECRET` to match the secret configured in Tebex

Notes:
- Purchases show up in `/dashboard/purchases` after webhooks are received.
- Support tickets are stored in Supabase (`tickets`, `ticket_messages`).

### Managing content (blog + vacancies)

**Blog** – Managed via **Decap CMS** at `/admin`:

- Open `https://your-site.co.uk/admin` (or `/admin` locally).
- Log in with **GitHub** (OAuth is configured via Netlify Functions: `oauth-begin`, `oauth-complete`).
- Use the **Blog** collection to create and edit posts. Content is stored in `content/blog/*.mdx` and committed to your repo.
- The **Pages** collection edits `content/pages/*.json` (Home, About, Team, etc.).

**Vacancies** – Managed via the **content admin** at `/admin/vacancies`:

- Set `CONTENT_ADMIN_SECRET` in your environment (min 8 characters). This is the password to access the content admin.
- Go to `https://your-site.co.uk/admin/vacancies`. You’ll be redirected to `/admin/login` until you sign in with that password.
- Create, edit, and delete vacancies. Data is stored in **Supabase** (`vacancies` table). Set status to **Open** and a **Published at** date for a vacancy to appear on the public site.

**Team** – Managed at `/admin/team` (same content admin password):

- Edit the **page intro** and manage **team members** (name, role, bio, avatar, Discord/GitHub/Twitter links, sort order).
- Data is stored in **Supabase** (`team_page` and `team_members` tables). Run the new SQL in `supabase/schema.sql` (team_page + team_members) if you haven’t already.
- If Supabase team data is missing, the public Team page falls back to `content/pages/team.json`.

### CMS (Decap / Netlify CMS)

- Decap admin UI lives at `/admin` (served from `public/admin/`).
- Uses **Decap CMS + GitHub backend**.
- Configure GitHub OAuth via Netlify Functions:
  - `/.netlify/functions/oauth-begin`
  - `/.netlify/functions/oauth-complete`

Content edited in Decap:

- Blog posts: `content/blog/*.mdx`
- Marketing page data: `content/pages/*.json`

### Tebex integration

All Tebex calls happen server-side via Next route handlers:

- Categories: `GET /api/store/categories`
- Package details: `GET /api/store/packages/:id`
- Basket lifecycle: `/api/basket/...`

The storefront UI is under:

- Store: `/store`
- Cart: `/store/cart`
- Checkout redirect: `/store/cart` → Tebex hosted checkout

