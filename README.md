## X-Ample Development Website

Full-stack Next.js site for **X-Ample Development / X-Ample Studios** with:

- **Marketing pages** (CMS-editable)
- **Blog** (MDX from repo)
- **Tebex store integration** (Headless API, server-side only)
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

### CMS (Decap / Netlify CMS)

- Admin UI lives at `/admin` (served from `public/admin/`).
- Uses **Decap CMS + GitHub backend** (Netlify Identity/Git Gateway are deprecated).
- Configure GitHub OAuth via Netlify Functions:
  - `/.netlify/functions/oauth-begin`
  - `/.netlify/functions/oauth-complete`

Content lives in:

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

