# B2B Lead Generation — n8n → Web App

Convert the **Apr2026-Deep Multiline Icebreaker** n8n workflow into a deployed Next.js web app that accepts user input, sends it to n8n, and displays the response.

### Status
- [x] Phase 1 — Audit: Workflow confirmed active at `https://abhijitfreelancerparanjape.n8n-wsk.com/webhook/deep-multiline-icebreaker`
- [x] Phase 2 — Build: Next.js app scaffolded, API route + form + webhook client complete
- [x] Phase 3 — Test: Full round-trip verified locally on port 3000
- [x] Phase 4 — Push to GitHub: https://github.com/paranjapeabhijitashok/b2b-lead-gen
- [x] Phase 5 — Deploy to Vercel: https://b2b-lead-gen-xi.vercel.app
- [x] Phase 6 — Google Maps + Status Polling: Replaced Apify with Google Maps Places API; added execution status check button; improved error messages

---

## Stack

- **Frontend:** Next.js (App Router) + React + Tailwind CSS
- **Backend logic:** n8n workflow via webhook
- **Repo:** GitHub (new repo, created at deploy time)
- **Hosting:** Vercel (auto-deploys on push to `main`)

---

## Phases

### 1. Audit — Verify n8n Workflow
- Use n8n MCP to load the B2B Lead Generation workflow
- Confirm a **Webhook** node is the trigger (HTTP POST, returns response)
- Confirm a **Respond to Webhook** node sends back structured JSON
- Fix any gaps before proceeding

### 2. Build — Next.js Frontend
- Scaffold app: `npx create-next-app@latest`
- Folder structure:
  ```
  app/          # Next.js App Router pages & API routes
  components/   # Reusable UI components
  lib/          # Webhook client, helpers
  .env.local    # Secrets (not committed)
  ```
- Build a form that POSTs to the n8n webhook via a Next.js API route (`app/api/submit/route.ts`)
- Render the n8n response in the UI

### 3. Test — Local Verification
- Run `npm run dev`
- Ensure the n8n workflow is **activated** before testing
- Verify full round-trip: form submission → n8n → response displayed

### 4. Push — GitHub
- Use GitHub MCP to create a new repo
- Push code; confirm `.env.local` is in `.gitignore`

### 5. Deploy — Vercel
- Import GitHub repo into Vercel
- Add env vars in Vercel dashboard (`N8N_WEBHOOK_URL`)
- Confirm production deploy is live
- Future: push to `main` → Vercel auto-deploys

---

## Conventions

| Item | Convention |
|------|-----------|
| n8n webhook URL | `N8N_WEBHOOK_URL` in `.env.local` |
| n8n calls | Always go through `app/api/submit/route.ts`, never from the client |
| Workflow state | Must be **activated** in n8n before any testing |
| Commits | Push to `main`; Vercel deploys automatically |

---

## Tools & MCPs Available

- **n8n MCP** — inspect, modify, and validate workflows in your n8n instance
- **GitHub MCP** — create repo, push files, manage branches
- **Vercel** — deploy and manage the live app

---

## Environment Variables

```bash
# .env.local (never commit)
N8N_WEBHOOK_URL=https://abhijitfreelancerparanjape.n8n-wsk.com/webhook/deep-multiline-icebreaker
GOOGLE_MAPS_API_KEY=<your key>        # Places API (New) — used in n8n workflow node
N8N_BASE_URL=https://abhijitfreelancerparanjape.n8n-wsk.com
N8N_API_KEY=<your n8n API key>        # Settings → API in n8n
```

All 4 variables must also be set in Vercel dashboard → Project → Settings → Environment Variables.

**n8n workflow:** `Apr2026-Deep Multiline Icebreaker` (ID: `F2jMLF0JA4l7aFVt`)
**Output sheet:** https://docs.google.com/spreadsheets/d/1gOX9YcT7TWzWSJIYO0Jbi_og87GFEWuFVtETHoWVLbc/edit?gid=0 (LeadGeneration → Leads tab)

## Lead Source: Google Maps (Phase 6+)

Leads are now sourced from **Google Maps Places API** (Text Search).
- Finds **businesses** (not individuals) matching Keywords + Location
- Returns: company name, website, address, phone number
- `Designation` from the form is used in the icebreaker prompt (e.g. "write an icebreaker targeting the CEO of this company")
- Email column in Google Sheet will be blank (Google Maps does not return emails)
- Workflow adds 2 new nodes: `Split Places` (splits the places array) and `Map to Lead Fields` (maps to expected field names)
