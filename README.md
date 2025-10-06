# SEO News Hub (Starter)

Free, simple, and automatic SEO news feed with summaries.

## What you get
- Static site (index.html) that reads `data/news.json`
- Curated sources list in `scraper/sources.yml`
- A Python scraper to collect items
- GitHub Actions that refresh news every 3 days
- Optional "Ask AI" endpoint (Cloudflare Workers)

## Quick start (no coding)
1. Upload these files to a public GitHub repo named `seo-news-hub`.
2. In GitHub → Settings → Pages → set **Branch**: `main`, **Folder**: `/ (root)`.
3. Visit: `https://<your-username>.github.io/seo-news-hub`

## How to update the news
- The GitHub Action runs automatically every 3 days.
- To trigger now: go to Actions tab → select the workflow → **Run workflow**.

## Run locally (optional)
```bash
pip install feedparser pyyaml beautifulsoup4
python scraper/scraper.py
python -m http.server 8080
# open http://localhost:8080
```

## Ask AI (optional)
- Deploy `api/ask-ai.js` as a Cloudflare Worker and set `ASK_AI_URL` in `app.js`.
- This is optional; the site works without it.
