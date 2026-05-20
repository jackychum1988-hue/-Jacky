# Dedup & Expand Content Sources Design

> **Goal:** Cross-day URL deduplication (7-day window) + expand from 4 to 16 social media bloggers across Douyin, Xiaohongshu, and Bilibili.

**Architecture:** New `dedup.py` module manages a 7-day rolling URL cache via GitHub Actions Cache. Two new fetchers (`xiaohongshu.py`, `bilibili.py`) use the same Bing search pattern as existing `douyin_bloggers.py`. Blogger lists expand in `config.py` from 4 to 16 total (14 Douyin + 2 Xiaohongshu + 1 Bilibili).

**Tech Stack:** Python 3.12, BeautifulSoup4, GitHub Actions Cache v4, JSON file for URL store.

---

## Feature 1: Cross-Day URL Dedup

### Mechanism

- File: `zs-property-agent/.seen_urls.json` (in cache, not repo)
- Structure: `{"YYYY-MM-DD": ["url1", "url2", ...]}`, rolling 7-day window
- Flow:
  1. Cache restore with `key: seen-urls-v1-<today>` + `restore-keys: seen-urls-v1-` to get latest
  2. After all fetchers complete, filter out items whose `link` appears in any day's list
  3. Run AI analysis + push with deduped items
  4. If push succeeds, write today's URLs to file, trim days older than 7
  5. Cache save

### Cache design

- Primary key: `seen-urls-v1-{{ steps.check-sent.outputs.today }}`
- Fallback keys: `seen-urls-v1-` (partial match, picks latest available)
- Path: `zs-property-agent/.seen_urls.json`

### dedup.py module

```python
# dedup.py
import json
import os
from datetime import datetime, timedelta

CACHE_FILE = ".seen_urls.json"
CACHE_TTL_DAYS = 7

def load_seen_urls() -> set:
    """Load all URLs seen in the last 7 days."""
    if not os.path.exists(CACHE_FILE):
        return set()
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        now = datetime.now()
        urls = set()
        for day_str, url_list in data.items():
            try:
                day = datetime.strptime(day_str, "%Y-%m-%d")
                if (now - day).days < CACHE_TTL_DAYS:
                    urls.update(url_list)
            except ValueError:
                continue
        return urls
    except (json.JSONDecodeError, OSError):
        return set()


def dedup_results(results: dict) -> dict:
    """Remove items whose links have been seen before."""
    seen = load_seen_urls()
    deduped = {}
    removed = 0
    for source, items in results.items():
        deduped[source] = []
        for item in items:
            link = item.get("link", "")
            if link and link in seen:
                removed += 1
                continue
            deduped[source].append(item)
    print(f"[dedup] removed {removed} duplicate items across all sources")
    return deduped


def save_seen_urls(results: dict):
    """Append today's URLs to the seen cache, trim old entries."""
    today = datetime.now().strftime("%Y-%m-%d")
    cutoff = (datetime.now() - timedelta(days=CACHE_TTL_DAYS)).strftime("%Y-%m-%d")

    # Load existing
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {}

    # Add today's URLs
    today_urls = []
    for items in results.values():
        for item in items:
            link = item.get("link", "")
            if link:
                today_urls.append(link)
    data[today] = today_urls

    # Trim old entries
    data = {k: v for k, v in data.items() if k >= cutoff}

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
```

---

## Feature 2: Expanded Blogger List

### config.py changes

```python
DOUYIN_BLOGGERS = [
    # Existing
    {"name": "罗宾Sir", "query": "罗宾Sir 中山 房产"},
    {"name": "中山小强总", "query": "中山小强总 房产"},
    {"name": "安个家中山东哥找房", "query": "东哥找房 中山"},
    {"name": "中山房探冉Sir", "query": "中山房探冉Sir"},
    # New
    {"name": "阿阳教买房", "query": "阿阳教买房 中山 房产"},
    {"name": "胡须哥说房", "query": "胡须哥说房 中山 三乡"},
    {"name": "中山亚文说房", "query": "中山亚文说房"},
    {"name": "中山房产李先生jason", "query": "中山房产李先生jason"},
    {"name": "双双看房", "query": "双双看房 中山"},
    {"name": "中山一姐房产", "query": "中山一姐房产"},
    {"name": "山姆说房咨询", "query": "山姆说房咨询 中山"},
    {"name": "中山八登找房", "query": "中山八登找房"},
    {"name": "中山房产吴同学", "query": "中山房产吴同学"},
    {"name": "点点看房vlog", "query": "点点看房vlog 中山"},
]

XIAOHONGSHU_BLOGGERS = [
    {"name": "罗宾Sir", "query": "罗宾Sir 中山 房产"},
    {"name": "壹方置业", "query": "壹方置业 中山 房产"},
]

BILIBILI_BLOGGERS = [
    {"name": "中山文英说房", "query": "中山文英说房"},
]
```

### New fetchers

**fetchers/xiaohongshu.py** — same Bing pattern as douyin_bloggers.py:
- Query: `site:xiaohongshu.com {blogger['query']}`
- Extract: `li.b_algo h2 a` for title/link, `.b_caption p` for snippet
- Return: list with `{blogger, title, link, snippet}`

**fetchers/bilibili.py** — same pattern:
- Query: `site:bilibili.com {blogger['query']}`
- Same extraction logic

---

## Feature 3: main.py Integration

### Updated flow

```python
fetchers = [
    ("anjuke", fetch_anjuke),
    ("zs_gov", fetch_zs_gov),
    ("zs_news", fetch_zs_news),
    ("douyin", fetch_douyin),
    ("xiaohongshu", fetch_xiaohongshu),
    ("bilibili", fetch_bilibili),
    ("youtube", fetch_youtube),
    ("facebook", fetch_facebook),
    ("hk_news", fetch_hk_news),
    ("finance", fetch_finance_news),
]

# After all fetchers complete:
results = dedup_results(results)  # NEW: cross-source + cross-day dedup

# Then enrich, analyze, report as before
```

---

## Feature 4: reporter.py & analyzer.py Updates

### reporter.py
- Add `xiaohongshu_items` and `bilibili_items` parameters to `build_report()`
- Add source link sections: `📕 小红书`, `🎬 B站`
- Use the same `_format_douyin_link` for these (blogger + title + link pattern)

### analyzer.py
- Add categories for new sources in the user message assembly:
  - Xiaohongshu grouped with social/blogger section
  - Bilibili grouped with social/blogger section

---

## Workflow Changes

```yaml
# Additional cache save/restore for seen URLs
- name: Restore URL dedup cache
  id: dedup-cache
  uses: actions/cache/restore@v4
  with:
    path: zs-property-agent/.seen_urls.json
    key: seen-urls-v1-${{ steps.check-sent.outputs.today }}
    restore-keys: seen-urls-v1-

- name: Save URL dedup cache
  if: success()
  uses: actions/cache/save@v4
  with:
    path: zs-property-agent/.seen_urls.json
    key: seen-urls-v1-${{ steps.check-sent.outputs.today }}
```

---

## Files Summary

| Action | Path |
|--------|------|
| Create | `zs-property-agent/dedup.py` |
| Create | `zs-property-agent/fetchers/xiaohongshu.py` |
| Create | `zs-property-agent/fetchers/bilibili.py` |
| Modify | `zs-property-agent/config.py` |
| Modify | `zs-property-agent/fetchers/__init__.py` |
| Modify | `zs-property-agent/main.py` |
| Modify | `zs-property-agent/reporter.py` |
| Modify | `zs-property-agent/analyzer.py` |
| Modify | `.github/workflows/daily-report.yml` |
| Update | `zs-property-agent/.gitignore` (add `.seen_urls.json`)

## Edge Cases

- **First run (no cache):** `seen_urls.json` doesn't exist → `load_seen_urls()` returns empty set → no filtering
- **Cache miss on day 2:** `restore-keys: seen-urls-v1-` picks up yesterday's cache → still valid (7-day window)
- **Empty results:** If all items are duplicates, AI analysis gets no content → `analyze()` returns empty string → fallback report with "今日暂无新内容"
- **Bing returns same link for different bloggers (same video):** Dedup handles this naturally via URL-level filtering
- **Blogger has no recent content:** Bing returns different/empty results → fewer items → dedup removes none
