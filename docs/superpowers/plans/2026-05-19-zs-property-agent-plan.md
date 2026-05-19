# 中山房产智能日报 Agent 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Python 脚本，每天自动搜集 6 路中山房产信息源，汇总为 Markdown 日报并通过 PushPlus 推送到个人微信。

**Architecture:** 模块化设计，6 个独立 fetcher 各负责一路信息源，并发执行；reporter 汇总为统一日报格式；pusher 负责微信推送；main.py 编排全流程。GitHub Actions 定时触发。

**Tech Stack:** Python 3.11+, requests, beautifulsoup4, feedparser, google-api-python-client, PushPlus HTTP API

---

### Task 1: 项目脚手架

**Files:**
- Create: `zs-property-agent/requirements.txt`
- Create: `zs-property-agent/.env.example`
- Create: `zs-property-agent/.gitignore`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p zs-property-agent/fetchers
```

- [ ] **Step 2: 写入 requirements.txt**

```
requests>=2.31.0
beautifulsoup4>=4.12.0
feedparser>=6.0.0
google-api-python-client>=2.100.0
python-dotenv>=1.0.0
```

- [ ] **Step 3: 写入 .env.example**

```
PUSHPLUS_TOKEN=your_pushplus_token_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

- [ ] **Step 4: 写入 .gitignore**

```
.env
__pycache__/
*.pyc
.DS_Store
```

- [ ] **Step 5: 安装依赖**

```bash
cd zs-property-agent && pip install -r requirements.txt
```

- [ ] **Step 6: Commit**

```bash
git add zs-property-agent/
git commit -m "feat: scaffold zs-property-agent project"
```

---

### Task 2: 配置模块

**Files:**
- Create: `zs-property-agent/config.py`

- [ ] **Step 1: 写入 config.py**

```python
import os
from dotenv import load_dotenv

load_dotenv()

PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

PUSHPLUS_URL = "https://www.pushplus.plus/send"

YOUTUBE_SEARCH_QUERIES = [
    "中山 买房",
    "中山 楼盘",
    "中山 房产",
    "深中通道 中山 楼市",
]

DOUYIN_BLOGGERS = [
    {"name": "罗宾Sir", "query": "罗宾Sir 中山 房产"},
    {"name": "中山小强总", "query": "中山小强总 房产"},
    {"name": "安个家中山东哥找房", "query": "东哥找房 中山"},
    {"name": "中山房探冉Sir", "query": "中山房探冉Sir"},
]

REQUEST_TIMEOUT = 15
MAX_ITEMS_PER_SOURCE = 5
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/config.py
git commit -m "feat: add config module"
```

---

### Task 3: 安居客抓取器

**Files:**
- Create: `zs-property-agent/fetchers/__init__.py`
- Create: `zs-property-agent/fetchers/anjuke.py`

- [ ] **Step 1: 写入 fetchers/__init__.py**

```python
from .anjuke import fetch_anjuke
from .zs_gov import fetch_zs_gov
from .zs_news import fetch_zs_news
from .douyin_bloggers import fetch_douyin
from .youtube_search import fetch_youtube
from .facebook_search import fetch_facebook
```

- [ ] **Step 2: 写入 fetchers/anjuke.py**

```python
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

ANJUKE_URL = "https://zs.fang.anjuke.com/loupan/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_anjuke() -> list[dict]:
    items = []
    try:
        resp = requests.get(ANJUKE_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for card in soup.select(".list-item")[:MAX_ITEMS_PER_SOURCE]:
            title_el = card.select_one(".item-title .items-name")
            price_el = card.select_one(".price")
            area_el = card.select_one(".list-map")
            tags_el = card.select(".tag-panel .tag")

            title = title_el.get_text(strip=True) if title_el else ""
            price = price_el.get_text(strip=True) if price_el else ""
            area = area_el.get_text(strip=True) if area_el else ""
            tags = [t.get_text(strip=True) for t in tags_el] if tags_el else []

            link_el = card.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = "https:" + link

            if title:
                items.append({
                    "title": title,
                    "price": price,
                    "area": area,
                    "tags": tags,
                    "link": link,
                })

    except requests.RequestException:
        pass

    return items
```

- [ ] **Step 3: Commit**

```bash
git add zs-property-agent/fetchers/__init__.py zs-property-agent/fetchers/anjuke.py
git commit -m "feat: add anjuke fetcher"
```

---

### Task 4: 中山住建局政策抓取器

**Files:**
- Create: `zs-property-agent/fetchers/zs_gov.py`

- [ ] **Step 1: 写入 fetchers/zs_gov.py**

```python
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

ZS_GOV_URL = "http://jsj.zs.gov.cn/zwgk/zcwj/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_zs_gov() -> list[dict]:
    items = []
    try:
        resp = requests.get(ZS_GOV_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for row in soup.select(".list-content li, .news-list li, .list li")[:MAX_ITEMS_PER_SOURCE]:
            a_el = row.select_one("a[href]")
            date_el = row.select_one(".date, .time, span:last-child")

            title = a_el.get_text(strip=True) if a_el else ""
            link = a_el["href"] if a_el else ""
            date = date_el.get_text(strip=True) if date_el else ""

            if link and not link.startswith("http"):
                link = "http://jsj.zs.gov.cn" + link

            if title:
                items.append({"title": title, "link": link, "date": date})

    except requests.RequestException:
        pass

    return items
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/fetchers/zs_gov.py
git commit -m "feat: add zs gov policy fetcher"
```

---

### Task 5: 中山日报新闻抓取器

**Files:**
- Create: `zs-property-agent/fetchers/zs_news.py`

- [ ] **Step 1: 写入 fetchers/zs_news.py**

```python
import feedparser
from datetime import datetime, timedelta
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

ZS_NEWS_RSS = "https://www.zsnews.cn/index.php/rss/index/index"


def fetch_zs_news() -> list[dict]:
    items = []
    try:
        feed = feedparser.parse(ZS_NEWS_RSS)
        recent = datetime.now() - timedelta(days=3)

        for entry in feed.entries[:MAX_ITEMS_PER_SOURCE]:
            title = entry.get("title", "")
            link = entry.get("link", "")
            summary = entry.get("summary", "")
            published = entry.get("published", "")

            try:
                from email.utils import parsedate_to_datetime
                pub_date = parsedate_to_datetime(published)
                pub_date = pub_date.replace(tzinfo=None)
                if pub_date < recent:
                    continue
            except (ValueError, TypeError):
                pass

            relevant_keywords = ["房", "楼", "深中", "城建", "规划", "公积金", "政策"]
            if any(kw in title for kw in relevant_keywords):
                items.append({
                    "title": title,
                    "link": link,
                    "summary": _clean_html(summary)[:200],
                    "date": published,
                })
    except Exception:
        pass

    return items


def _clean_html(raw: str) -> str:
    from html import unescape
    import re
    text = re.sub(r"<[^>]+>", "", raw)
    return unescape(text).strip()
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/fetchers/zs_news.py
git commit -m "feat: add zs news fetcher"
```

---

### Task 6: 抖音房产主播抓取器

**Files:**
- Create: `zs-property-agent/fetchers/douyin_bloggers.py`

- [ ] **Step 1: 写入 fetchers/douyin_bloggers.py**

```python
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE, DOUYIN_BLOGGERS

SEARCH_URL = "https://www.google.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_douyin() -> list[dict]:
    items = []
    for blogger in DOUYIN_BLOGGERS:
        try:
            params = {
                "q": f"site:douyin.com {blogger['query']}",
                "tbs": "qdr:w",  # past week
                "num": 3,
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select(".g")[:2]:
                a_el = result.select_one("a[href]")
                snippet_el = result.select_one(".VwiC3b")

                title = ""
                link = ""
                if a_el:
                    title = a_el.get_text(strip=True)
                    link = a_el.get("href", "")

                snippet = snippet_el.get_text(strip=True)[:100] if snippet_el else ""

                if title and "douyin.com" in link:
                    items.append({
                        "blogger": blogger["name"],
                        "title": title,
                        "link": link,
                        "snippet": snippet,
                    })
        except requests.RequestException:
            continue

    return items[:MAX_ITEMS_PER_SOURCE]
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/fetchers/douyin_bloggers.py
git commit -m "feat: add douyin blogger fetcher"
```

---

### Task 7: YouTube 搜索抓取器

**Files:**
- Create: `zs-property-agent/fetchers/youtube_search.py`

- [ ] **Step 1: 写入 fetchers/youtube_search.py**

```python
from config import YOUTUBE_API_KEY, YOUTUBE_SEARCH_QUERIES, MAX_ITEMS_PER_SOURCE, REQUEST_TIMEOUT
import requests


def fetch_youtube() -> list[dict]:
    if not YOUTUBE_API_KEY:
        return []

    items = []
    for query in YOUTUBE_SEARCH_QUERIES[:2]:
        try:
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": 3,
                "order": "date",
                "relevanceLanguage": "zh",
                "key": YOUTUBE_API_KEY,
            }
            resp = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params=params,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()

            for item in data.get("items", []):
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                items.append({
                    "title": snippet["title"],
                    "channel": snippet["channelTitle"],
                    "link": f"https://www.youtube.com/watch?v={video_id}",
                    "published": snippet["publishedAt"][:10],
                })
        except requests.RequestException:
            continue

    seen = set()
    unique = []
    for item in items:
        if item["link"] not in seen:
            seen.add(item["link"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/fetchers/youtube_search.py
git commit -m "feat: add youtube search fetcher"
```

---

### Task 8: Facebook 搜索抓取器

**Files:**
- Create: `zs-property-agent/fetchers/facebook_search.py`

- [ ] **Step 1: 写入 fetchers/facebook_search.py**

```python
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

FB_SEARCH_QUERIES = [
    "中山 房产 facebook",
    "中山 買樓 facebook",
    "中山 大灣區 置業 facebook",
]
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_facebook() -> list[dict]:
    items = []
    for query in FB_SEARCH_QUERIES:
        try:
            params = {"q": query, "num": 5}
            resp = requests.get(
                "https://www.google.com/search",
                headers=HEADERS,
                params=params,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select(".g")[:3]:
                a_el = result.select_one("a[href]")
                snippet_el = result.select_one(".VwiC3b")

                link = ""
                if a_el:
                    href = a_el.get("href", "")
                    if "facebook.com" in href:
                        link = href

                snippet = snippet_el.get_text(strip=True)[:150] if snippet_el else ""

                if link:
                    items.append({
                        "title": a_el.get_text(strip=True) if a_el else "",
                        "link": link,
                        "snippet": snippet,
                    })
        except requests.RequestException:
            continue

    seen = set()
    unique = []
    for item in items:
        if item["link"] not in seen:
            seen.add(item["link"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/fetchers/facebook_search.py
git commit -m "feat: add facebook search fetcher"
```

---

### Task 9: 日报汇总器

**Files:**
- Create: `zs-property-agent/reporter.py`

- [ ] **Step 1: 写入 reporter.py**

```python
from datetime import datetime


def build_report(
    anjuke_items: list[dict],
    zs_gov_items: list[dict],
    zs_news_items: list[dict],
    douyin_items: list[dict],
    youtube_items: list[dict],
    facebook_items: list[dict],
) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [f"🏠 中山房产日报 | {today}", ""]

    _add_section(lines, "📰 【政策与城建】", zs_gov_items, _format_gov)
    _add_section(lines, "📰 【中山日报·楼市城建】", zs_news_items, _format_news)
    _add_section(lines, "🏗 【新盘动态】", anjuke_items, _format_anjuke)
    _add_section(lines, "🎙 【抖音主播动态】", douyin_items, _format_douyin)
    _add_section(lines, "📺 【YouTube 热门短片】", youtube_items, _format_youtube)
    _add_section(lines, "📘 【Facebook 热门帖文】", facebook_items, _format_facebook)

    if len(lines) <= 2:
        lines.append("今日暂无新数据，请稍后关注。")

    lines.append("")
    lines.append("> 🤖 由中山房产智能Agent自动生成")
    return "\n".join(lines)


def _add_section(lines: list[str], heading: str, items: list[dict], fmt_fn):
    if not items:
        return
    lines.append(heading)
    for item in items:
        lines.append(fmt_fn(item))
    lines.append("")


def _format_gov(item: dict) -> str:
    date = f" ({item.get('date', '')})" if item.get("date") else ""
    return f"- [{item['title']}]({item['link']}){date}"


def _format_news(item: dict) -> str:
    summary = item.get("summary", "")
    detail = f" — {summary}" if summary else ""
    return f"- [{item['title']}]({item['link']}){detail}"


def _format_anjuke(item: dict) -> str:
    parts = []
    if item.get("area"):
        parts.append(item["area"])
    if item.get("price"):
        parts.append(item["price"])
    tags = " · ".join(item.get("tags", []))
    info = f" | {' · '.join(parts)}" if parts else ""
    tag_str = f" [🏷 {tags}]" if tags else ""
    link = item.get("link", "")
    if link:
        return f"- [{item['title']}]({link}){info}{tag_str}"
    return f"- {item['title']}{info}{tag_str}"


def _format_douyin(item: dict) -> str:
    snippet = f" — {item.get('snippet', '')}" if item.get("snippet") else ""
    return f"- **{item['blogger']}**：[{item['title']}]({item['link']}){snippet}"


def _format_youtube(item: dict) -> str:
    channel = f" | {item['channel']}" if item.get("channel") else ""
    return f"- [{item['title']}]({item['link']}){channel}"


def _format_facebook(item: dict) -> str:
    snippet = f" — {item.get('snippet', '')}" if item.get("snippet") else ""
    title = item.get("title", "") or "查看帖文"
    return f"- [{title}]({item['link']}){snippet}"
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/reporter.py
git commit -m "feat: add daily report builder"
```

---

### Task 10: PushPlus 推送器

**Files:**
- Create: `zs-property-agent/pusher.py`

- [ ] **Step 1: 写入 pusher.py**

```python
import requests
from config import PUSHPLUS_TOKEN, PUSHPLUS_URL, REQUEST_TIMEOUT


def push_to_wechat(title: str, content: str) -> dict:
    if not PUSHPLUS_TOKEN:
        return {"code": -1, "msg": "PUSHPLUS_TOKEN not configured"}

    payload = {
        "token": PUSHPLUS_TOKEN,
        "title": title,
        "content": content,
        "template": "markdown",
        "channel": "wechat",
    }

    try:
        resp = requests.post(PUSHPLUS_URL, json=payload, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        return {"code": -1, "msg": str(e)}
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/pusher.py
git commit -m "feat: add pushplus wechat pusher"
```

---

### Task 11: 主编排器

**Files:**
- Create: `zs-property-agent/main.py`

- [ ] **Step 1: 写入 main.py**

```python
import concurrent.futures
import traceback
from datetime import datetime
from fetchers import (
    fetch_anjuke,
    fetch_zs_gov,
    fetch_zs_news,
    fetch_douyin,
    fetch_youtube,
    fetch_facebook,
)
from reporter import build_report
from pusher import push_to_wechat


def run_fetcher(name: str, fn) -> tuple[str, list[dict]]:
    try:
        result = fn()
        print(f"[{name}] fetched {len(result)} items")
        return name, result
    except Exception as e:
        print(f"[{name}] failed: {e}")
        traceback.print_exc()
        return name, []


def main():
    print(f"=== 中山房产日报 Agent | {datetime.now().isoformat()} ===")

    fetchers = [
        ("anjuke", fetch_anjuke),
        ("zs_gov", fetch_zs_gov),
        ("zs_news", fetch_zs_news),
        ("douyin", fetch_douyin),
        ("youtube", fetch_youtube),
        ("facebook", fetch_facebook),
    ]

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(run_fetcher, name, fn): name for name, fn in fetchers}
        for future in concurrent.futures.as_completed(futures, timeout=60):
            name, items = future.result()
            results[name] = items

    report = build_report(
        anjuke_items=results.get("anjuke", []),
        zs_gov_items=results.get("zs_gov", []),
        zs_news_items=results.get("zs_news", []),
        douyin_items=results.get("douyin", []),
        youtube_items=results.get("youtube", []),
        facebook_items=results.get("facebook", []),
    )

    title = f"🏠 中山房产日报 {datetime.now().strftime('%m/%d')}"
    push_result = push_to_wechat(title, report)
    print(f"Push result: {push_result}")

    print(report)
    print("=== Done ===")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/main.py
git commit -m "feat: add main orchestrator with concurrent fetchers"
```

---

### Task 12: GitHub Actions 定时任务

**Files:**
- Create: `zs-property-agent/.github/workflows/daily-report.yml`

- [ ] **Step 1: 创建 .github/workflows/daily-report.yml**

```yaml
name: Daily ZS Property Report

on:
  schedule:
    - cron: "0 1 * * *"  # UTC 1:00 = 北京时间 9:00
  workflow_dispatch:  # 允许手动触发

jobs:
  daily-report:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run daily report
        env:
          PUSHPLUS_TOKEN: ${{ secrets.PUSHPLUS_TOKEN }}
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
        run: python main.py
```

- [ ] **Step 2: Commit**

```bash
git add zs-property-agent/.github/workflows/daily-report.yml
git commit -m "feat: add github actions daily schedule"
```

---

### Task 13: 本地验证 & README

**Files:**
- Create: `zs-property-agent/README.md`

- [ ] **Step 1: 写入 README.md**

```markdown
# 中山房产智能日报 Agent

每天早上 9:00 自动搜集中山房产信息，通过 PushPlus 推送到个人微信。

## 快速开始

### 1. 获取 PushPlus Token
- 访问 pushplus.plus 注册
- 关注其公众号，获取你的 Token

### 2. 获取 YouTube API Key（可选）
- 访问 Google Cloud Console
- 启用 YouTube Data API v3
- 创建 API Key

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 填入你的 Token 和 Key
```

### 4. 本地测试
```bash
pip install -r requirements.txt
python main.py
```

### 5. 部署到 GitHub
- 将代码推送到 GitHub 仓库
- 在 Settings > Secrets and variables > Actions 中添加：
  - `PUSHPLUS_TOKEN`
  - `YOUTUBE_API_KEY`（可选）
- Actions 会每天早上 9:00 自动运行
- 也可以在 Actions 页面手动触发测试
```

- [ ] **Step 2: 本地运行测试**

```bash
cd zs-property-agent && python main.py
```

- [ ] **Step 3: Commit**

```bash
git add zs-property-agent/README.md
git commit -m "docs: add readme and finalize agent"
```

---
