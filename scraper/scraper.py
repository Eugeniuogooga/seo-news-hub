# Scraper: fetches items from sources.yml and writes data/news.json
# Run locally: python scraper/scraper.py
# Requires: pip install feedparser pyyaml beautifulsoup4

import os, json, re, hashlib
from pathlib import Path
from datetime import datetime, timezone
import feedparser
from bs4 import BeautifulSoup
import yaml

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DATA.mkdir(parents=True, exist_ok=True)
SRC = Path(__file__).resolve().parent

def canon(url: str) -> str:
    return re.sub(r"[?#].*$", "", (url or "").strip())

sources = yaml.safe_load(open(SRC / "sources.yml", "r", encoding="utf-8"))
items = []

for feed in sources:
    d = feedparser.parse(feed)
    # If it's not a feed (e.g., a normal page), skip for now.
    if not d.entries and not d.feed:
        continue
    source_name = d.feed.get("title", feed) if hasattr(d, "feed") else feed
    for e in d.entries:
        url = canon(e.get("link") or e.get("id") or "")
        if not url:
            continue
        summary_html = e.get("summary") or e.get("description") or ""
        summary = BeautifulSoup(summary_html, "html.parser").get_text(" ").strip()
        items.append({
            "id": hashlib.md5(url.encode()).hexdigest(),
            "title": e.get("title", "(no title)"),
            "url": url,
            "source": source_name,
            "published": e.get("published") or e.get("updated"),
            "summary": summary[:800]
        })

# Dedupe by URL hash, newest first
seen = set()
deduped = []
for it in sorted(items, key=lambda x: x.get("published") or "", reverse=True):
    if it["id"] in seen:
        continue
    seen.add(it["id"])
    deduped.append(it)

# Optional AI summaries (later). For now, copy summary over.
for it in deduped:
    it["ai_summary"] = it.get("ai_summary") or it.get("summary", "")

out = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "items": deduped[:150]
}

(DATA / "news.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Saved {len(out['items'])} items -> data/news.json")
