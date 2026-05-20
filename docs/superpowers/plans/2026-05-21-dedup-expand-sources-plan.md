# Dedup & Expand Content Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7-day cross-day URL deduplication and expand social media bloggers from 4 to 16 across Douyin, Xiaohongshu, and Bilibili.

**Architecture:** New `dedup.py` module loads/saves a JSON URL cache via GitHub Actions Cache. Two new fetchers (`xiaohongshu.py`, `bilibili.py`) copy the existing `douyin_bloggers.py` Bing search pattern with `site:` operators. Blogger lists expand in `config.py`. `main.py` calls dedup after all fetchers complete, before AI analysis.

**Tech Stack:** Python 3.12, BeautifulSoup4 (Bing parsing), json (cache), GitHub Actions Cache v4

---

### Task 1: Cross-Day URL Dedup Module

**Files:**
- Create: `zs-property-agent/dedup.py`

- [ ] **Step 1: Write dedup.py**

```python
"""Cross-day URL deduplication via JSON cache (7-day rolling window)."""
import json
import os
from datetime import datetime, timedelta

CACHE_FILE = ".seen_urls.json"
CACHE_TTL_DAYS = 7


def load_seen_urls() -> set:
    """Load all URLs seen in the last 7 days from cache file."""
    if not os.path.exists(CACHE_FILE):
        return set()
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return set()

    cutoff = datetime.now() - timedelta(days=CACHE_TTL_DAYS)
    urls = set()
    for day_str, url_list in data.items():
        try:
            day = datetime.strptime(day_str, "%Y-%m-%d")
        except ValueError:
            continue
        if day >= cutoff:
            urls.update(url_list)
    return urls


def dedup_results(results: dict) -> dict:
    """Remove items whose link has been seen in the last 7 days.

    Args:
        results: {source_name: [items_with_link_key]}

    Returns:
        Same structure with duplicate items removed.
    """
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
    if removed:
        print(f"[dedup] removed {removed} duplicate items across all sources")
    return deduped


def save_seen_urls(results: dict):
    """Persist today's URLs to the cache file, dropping entries older than 7 days.

    Args:
        results: {source_name: [items_with_link_key]} (after dedup, ready to push)
    """
    today = datetime.now().strftime("%Y-%m-%d")
    cutoff = (datetime.now() - timedelta(days=CACHE_TTL_DAYS)).strftime("%Y-%m-%d")

    data = {}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    today_urls = []
    for items in results.values():
        for item in items:
            link = item.get("link", "")
            if link:
                today_urls.append(link)
    data[today] = today_urls

    # Trim old
    data = {k: v for k, v in data.items() if k >= cutoff}

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
```

- [ ] **Step 2: Verify module imports cleanly**

Run: `cd zs-property-agent && python -c "from dedup import load_seen_urls, dedup_results, save_seen_urls; print('import ok')"`
Expected: `import ok`

- [ ] **Step 3: Quick smoke test with temp file**

```bash
cd zs-property-agent && python -c "
from dedup import dedup_results, save_seen_urls, load_seen_urls
import os

# Clean start
if os.path.exists('.seen_urls.json'):
    os.remove('.seen_urls.json')

# First run: no cache, all items pass through
results = {'douyin': [{'link': 'https://example.com/a', 'title': 'test'}]}
deduped = dedup_results(results)
assert len(deduped['douyin']) == 1, 'first run should pass through'

# Save
save_seen_urls(deduped)
assert os.path.exists('.seen_urls.json'), 'cache file created'

# Second run: same URL should be deduped
results2 = {'douyin': [{'link': 'https://example.com/a', 'title': 'test2'}]}
deduped2 = dedup_results(results2)
assert len(deduped2['douyin']) == 0, 'duplicate should be removed'

os.remove('.seen_urls.json')
print('smoke test passed')
"
```
Expected: `smoke test passed`

- [ ] **Step 4: Commit**

```bash
git add zs-property-agent/dedup.py
git commit -m "feat: add cross-day URL dedup module (7-day rolling window)"
```

---

### Task 2: Expand Blogger Lists in config.py

**Files:**
- Modify: `zs-property-agent/config.py`

- [ ] **Step 1: Replace DOUYIN_BLOGGERS and add XIAOHONGSHU_BLOGGERS + BILIBILI_BLOGGERS**

Replace the existing `DOUYIN_BLOGGERS` list (lines 25-30) with the expanded list. Then add two new lists right after it.

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

- [ ] **Step 2: Verify import**

Run: `cd zs-property-agent && python -c "from config import DOUYIN_BLOGGERS, XIAOHONGSHU_BLOGGERS, BILIBILI_BLOGGERS; print(f'douyin:{len(DOUYIN_BLOGGERS)} xhs:{len(XIAOHONGSHU_BLOGGERS)} bili:{len(BILIBILI_BLOGGERS)}')"`
Expected: `douyin:14 xhs:2 bili:1`

- [ ] **Step 3: Commit**

```bash
git add zs-property-agent/config.py
git commit -m "feat: expand to 14 douyin + 2 xiaohongshu + 1 bilibili bloggers"
```

---

### Task 3: Xiaohongshu Fetcher

**Files:**
- Create: `zs-property-agent/fetchers/xiaohongshu.py`

- [ ] **Step 1: Write fetchers/xiaohongshu.py**

Follow the exact same pattern as `douyin_bloggers.py`, using Bing `site:xiaohongshu.com`:

```python
"""Xiaohongshu blogger search via Bing."""
import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE, XIAOHONGSHU_BLOGGERS

SEARCH_URL = "https://www.bing.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_xiaohongshu() -> list[dict]:
    items = []
    for blogger in XIAOHONGSHU_BLOGGERS:
        try:
            params = {
                "q": f"site:xiaohongshu.com {blogger['query']}",
                "count": 5,
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select("li.b_algo")[:2]:
                a_el = result.select_one("h2 a")
                snippet_el = result.select_one(".b_caption p")

                title = a_el.get_text(strip=True) if a_el else ""
                link = a_el.get("href", "") if a_el else ""

                snippet = snippet_el.get_text(strip=True)[:100] if snippet_el else ""

                if title and link:
                    items.append({
                        "blogger": blogger["name"],
                        "title": title,
                        "link": link,
                        "snippet": snippet,
                    })
        except requests.RequestException as e:
            print(f"[xiaohongshu] request error for {blogger['name']}: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[xiaohongshu] error for {blogger['name']}: {e}", file=sys.stderr)
            continue

    return items[:MAX_ITEMS_PER_SOURCE]
```

- [ ] **Step 2: Verify import**

Run: `cd zs-property-agent && python -c "from fetchers.xiaohongshu import fetch_xiaohongshu; print('import ok')"`
Expected: `import ok`

- [ ] **Step 3: Commit**

```bash
git add zs-property-agent/fetchers/xiaohongshu.py
git commit -m "feat: add xiaohongshu fetcher (Bing site search)"
```

---

### Task 4: Bilibili Fetcher

**Files:**
- Create: `zs-property-agent/fetchers/bilibili.py`

- [ ] **Step 1: Write fetchers/bilibili.py**

Same pattern with `site:bilibili.com`:

```python
"""Bilibili blogger search via Bing."""
import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE, BILIBILI_BLOGGERS

SEARCH_URL = "https://www.bing.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_bilibili() -> list[dict]:
    items = []
    for blogger in BILIBILI_BLOGGERS:
        try:
            params = {
                "q": f"site:bilibili.com {blogger['query']}",
                "count": 5,
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select("li.b_algo")[:2]:
                a_el = result.select_one("h2 a")
                snippet_el = result.select_one(".b_caption p")

                title = a_el.get_text(strip=True) if a_el else ""
                link = a_el.get("href", "") if a_el else ""

                snippet = snippet_el.get_text(strip=True)[:100] if snippet_el else ""

                if title and link:
                    items.append({
                        "blogger": blogger["name"],
                        "title": title,
                        "link": link,
                        "snippet": snippet,
                    })
        except requests.RequestException as e:
            print(f"[bilibili] request error for {blogger['name']}: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[bilibili] error for {blogger['name']}: {e}", file=sys.stderr)
            continue

    return items[:MAX_ITEMS_PER_SOURCE]
```

- [ ] **Step 2: Verify import**

Run: `cd zs-property-agent && python -c "from fetchers.bilibili import fetch_bilibili; print('import ok')"`
Expected: `import ok`

- [ ] **Step 3: Commit**

```bash
git add zs-property-agent/fetchers/bilibili.py
git commit -m "feat: add bilibili fetcher (Bing site search)"
```

---

### Task 5: Integration — Wire Everything Together

**Files:**
- Modify: `zs-property-agent/fetchers/__init__.py`
- Modify: `zs-property-agent/main.py`
- Modify: `zs-property-agent/reporter.py`
- Modify: `zs-property-agent/analyzer.py`
- Modify: `.github/workflows/daily-report.yml`
- Modify: `zs-property-agent/.gitignore`

- [ ] **Step 1: Update fetchers/__init__.py**

Add the two new imports after line 7 (`from .youtube_search import fetch_youtube`):

```python
from .anjuke import fetch_anjuke
from .zs_gov import fetch_zs_gov
from .zs_news import fetch_zs_news
from .douyin_bloggers import fetch_douyin
from .xiaohongshu import fetch_xiaohongshu
from .bilibili import fetch_bilibili
from .youtube_search import fetch_youtube
from .facebook_search import fetch_facebook
from .hk_news import fetch_hk_news
from .finance_news import fetch_finance_news
```

- [ ] **Step 2: Update main.py — add fetchers + dedup**

Two changes in `main.py`:

**Change 1:** In the `fetchers` list in `main()` (around line 48-57), add the two new fetchers after douyin:

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
```

**Change 2:** After the fetcher results are collected (after the `for future...` loop, around line 64), add the dedup step. Also add the import:

Add import at top (after line 16):
```python
from dedup import dedup_results, save_seen_urls
```

After the fetcher results loop, before `enrich_news_items`:
```python
    # Dedup across days
    print("[main] deduplicating against 7-day URL cache...")
    results = dedup_results(results)
```

**Change 3:** After `push_to_wechat`, inside the success block (around line 95-97), add `save_seen_urls` call:

```python
    if push_result.get("code") == 200:
        with open(".sentinel", "w") as f:
            f.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        save_seen_urls(results)
```

- [ ] **Step 3: Update reporter.py — new sections**

**Change 1:** Update `build_report()` function signature (line 36-44) to accept new parameters:

```python
def build_report(
    anjuke_items: list[dict],
    zs_gov_items: list[dict],
    zs_news_items: list[dict],
    douyin_items: list[dict],
    xiaohongshu_items: list[dict],
    bilibili_items: list[dict],
    youtube_items: list[dict],
    facebook_items: list[dict],
    hk_news_items: list[dict],
    finance_items: list[dict],
    ai_analysis: str = "",
) -> str:
```

**Change 2:** In the AI analysis mode (inside `if ai_analysis:`), add links sections for new sources after the douyin section (around line 58):

```python
        _add_links_section(lines, "🎙 抖音博主", douyin_items, _format_douyin_link)
        _add_links_section(lines, "📕 小红书", xiaohongshu_items, _format_douyin_link)
        _add_links_section(lines, "🎬 B站", bilibili_items, _format_douyin_link)
```

**Change 3:** In the fallback mode (the `else:` branch), add sections for new sources after douyin (around line 70):

```python
        _add_section(lines, "🎙 【抖音主播动态】", douyin_items, _format_douyin)
        _add_section(lines, "📕 【小红书】", xiaohongshu_items, _format_douyin)
        _add_section(lines, "🎬 【B站】", bilibili_items, _format_douyin)
```

- [ ] **Step 4: Update analyzer.py — new source categories**

In the `analyze()` function, after the social/blogger section (around line 124-138), add xiaohongshu and bilibili to the `social_sources` tuple:

Change line 123:
```python
    # Category 5: Social/blogger
    social_sources = ("douyin", "xiaohongshu", "bilibili", "youtube", "facebook")
```

- [ ] **Step 5: Update .github/workflows/daily-report.yml — new cache step**

After the existing `Restore sentinel` cache step (after the `actions/cache/restore@v4` block for `.sentinel`), add:

```yaml
           - name: Restore URL dedup cache
             id: dedup-cache
             uses: actions/cache/restore@v4
             with:
               path: zs-property-agent/.seen_urls.json
               key: seen-urls-v1-${{ steps.check-sent.outputs.today }}
               restore-keys: seen-urls-v1-
```

And after the `Save sentinel` cache step, add:

```yaml
           - name: Save URL dedup cache
             if: success()
             uses: actions/cache/save@v4
             with:
               path: zs-property-agent/.seen_urls.json
               key: seen-urls-v1-${{ steps.check-sent.outputs.today }}
```

- [ ] **Step 6: Update .gitignore**

Add `.seen_urls.json` to the gitignore. Edit `zs-property-agent/.gitignore`:

Add this line:
```
.sentinel
.seen_urls.json
```

(If `.sentinel` is already there, just add `.seen_urls.json` on the next line)

- [ ] **Step 7: Update main.py call to build_report**

In `main.py`, the `build_report()` call (around line 78-88) needs the new parameters:

```python
    report = build_report(
        anjuke_items=results.get("anjuke", []),
        zs_gov_items=results.get("zs_gov", []),
        zs_news_items=results.get("zs_news", []),
        douyin_items=results.get("douyin", []),
        xiaohongshu_items=results.get("xiaohongshu", []),
        bilibili_items=results.get("bilibili", []),
        youtube_items=results.get("youtube", []),
        facebook_items=results.get("facebook", []),
        hk_news_items=results.get("hk_news", []),
        finance_items=results.get("finance", []),
        ai_analysis=ai_analysis,
    )
```

- [ ] **Step 8: Verify full import chain**

Run: `cd zs-property-agent && python -c "from main import main; print('full import chain ok')"`
Expected: `full import chain ok`

- [ ] **Step 9: Commit**

```bash
git add zs-property-agent/fetchers/__init__.py zs-property-agent/main.py zs-property-agent/reporter.py zs-property-agent/analyzer.py .github/workflows/daily-report.yml zs-property-agent/.gitignore
git commit -m "feat: wire dedup + xiaohongshu + bilibili into main pipeline"
```
