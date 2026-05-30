# 中山楼盘每周排行榜视频 — 实施计划

> **For agentic workers:** Use `subagent-driven-development` (recommended) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从中山住建局和贝壳抓取数据，自动生成每周「成交量TOP10 + 热度TOP10 + 涨跌TOP10」透明叠加视频。

**Architecture:** 新建 `zs-ranking-agent/` Python agent 负责数据抓取/聚合/排名计算和 timeline JSON 生成；新建 3 个 Remotion SVG 图表组件注册到 overlayComponentMap；render_ranking.ts 复刻 render_pip.ts 渲染 ProRes 4444 透明通道视频。

**Tech Stack:** Python 3.12 (requests, beautifulsoup4), Remotion 4.x, React 19, TypeScript 5, GitHub Actions

---

### Task 1: zs-ranking-agent 项目脚手架

**Files:**
- Create: `zs-ranking-agent/requirements.txt`
- Create: `zs-ranking-agent/config.py`
- Create: `zs-ranking-agent/fetchers/__init__.py`
- Create: `zs-ranking-agent/output/.gitkeep`
- Create: `zs-ranking-agent/history.json`

- [ ] **Step 1: Create requirements.txt**

```txt
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=5.0.0
```

- [ ] **Step 2: Create config.py with 38-project name map and fuzzy matching**

```python
"""zs-ranking-agent config — 38 Zhongshan project name map + matching."""

# Canonical 38-project list (synced with remotion-realestate projectData.ts)
PROJECTS: list[dict] = [
    {"id": 1, "name": "江山和鸣", "district": "石岐", "aliases": ["江山和鸣"]},
    {"id": 2, "name": "保利琅悦", "district": "東區", "aliases": ["保利琅悦", "保利瑯悦"]},
    {"id": 3, "name": "囍滙·Central Peak", "district": "東區", "aliases": ["囍滙", "Central Peak", "囍汇"]},
    {"id": 4, "name": "御宸", "district": "石岐", "aliases": ["御宸"]},
    {"id": 5, "name": "建华龙湖·香山颂", "district": "石岐", "aliases": ["建华龙湖", "香山颂", "建华龙湖香山颂"]},
    {"id": 6, "name": "遠洋天著", "district": "南區", "aliases": ["远洋天著", "遠洋天著"]},
    {"id": 7, "name": "中山108天寓", "district": "東區", "aliases": ["中山108", "108天寓", "中山108天寓"]},
    {"id": 8, "name": "華潤仁恒公園四季2期", "district": "西區", "aliases": ["华润仁恒", "公园四季", "仁恒公园四季", "華潤仁恒公園四季"]},
    {"id": 9, "name": "幸福匯", "district": "西區", "aliases": ["幸福汇", "幸福匯"]},
    {"id": 10, "name": "展睿·江樾灣", "district": "石岐", "aliases": ["展睿", "江樾湾", "江樾灣", "展睿江樾湾"]},
    {"id": 11, "name": "錦繡海灣城", "district": "翠亨", "aliases": ["锦绣海湾城", "錦繡海灣城"]},
    {"id": 12, "name": "華發觀山水", "district": "三鄉", "aliases": ["华发观山水", "華發觀山水"]},
    {"id": 13, "name": "佳境康城", "district": "坦洲", "aliases": ["佳境康城"]},
    {"id": 14, "name": "錦繡國際花城", "district": "坦洲", "aliases": ["锦绣国际花城", "錦繡國際花城"]},
    {"id": 15, "name": "雅居樂·萬象郡", "district": "三鄉", "aliases": ["雅居乐万象郡", "雅居樂萬象郡", "万象郡"]},
    {"id": 16, "name": "中澳春城", "district": "坦洲", "aliases": ["中澳春城"]},
    {"id": 17, "name": "港航匯", "district": "市區", "aliases": ["港航汇", "港航匯"]},
    {"id": 18, "name": "海雅繽紛城", "district": "南頭", "aliases": ["海雅缤纷城", "海雅繽紛城"]},
    {"id": 19, "name": "保利香山瑧悦府", "district": "東區", "aliases": ["保利香山瑧悦府", "保利香山臻悦府"]},
    {"id": 20, "name": "朗詩金鐘湖壹號", "district": "東區", "aliases": ["朗诗金钟湖壹号", "朗詩金鐘湖壹號", "金钟湖壹号"]},
    {"id": 21, "name": "華發學府壹號", "district": "石岐", "aliases": ["华发学府壹号", "華發學府壹號"]},
    {"id": 22, "name": "金鷹半山花園", "district": "石岐", "aliases": ["金鹰半山花园", "金鷹半山花園"]},
    {"id": 23, "name": "華立富華薈", "district": "西區", "aliases": ["华立富华荟", "華立富華薈"]},
    {"id": 24, "name": "懿臻山", "district": "南區", "aliases": ["懿臻山"]},
    {"id": 25, "name": "碧桂園·鳳凰城", "district": "南區", "aliases": ["碧桂园凤凰城", "碧桂園鳳凰城", "凤凰城"]},
    {"id": 26, "name": "招商臻灣府", "district": "翠亨", "aliases": ["招商臻湾府", "招商臻灣府"]},
    {"id": 27, "name": "中山粵海城", "district": "翠亨", "aliases": ["中山粤海城", "中山粵海城", "粤海城"]},
    {"id": 28, "name": "中興智慧城·懿禧府", "district": "翠亨", "aliases": ["中兴智慧城", "懿禧府", "中興智慧城懿禧府"]},
    {"id": 29, "name": "保利天匯·熙岸", "district": "翠亨", "aliases": ["保利天汇熙岸", "保利天匯·熙岸"]},
    {"id": 30, "name": "雅居樂灣際壹號", "district": "翠亨", "aliases": ["雅居乐湾际壹号", "雅居樂灣際壹號", "湾际壹号"]},
    {"id": 31, "name": "御峰香林", "district": "火炬", "aliases": ["御峰香林"]},
    {"id": 32, "name": "火炬建發·望江台", "district": "火炬", "aliases": ["火炬建发望江台", "火炬建發望江台", "望江台"]},
    {"id": 33, "name": "東方名都", "district": "火炬", "aliases": ["东方名都", "東方名都"]},
    {"id": 34, "name": "逸駿半島", "district": "坦洲", "aliases": ["逸骏半岛", "逸駿半島"]},
    {"id": 35, "name": "優越香格里", "district": "坦洲", "aliases": ["优越香格里", "優越香格里"]},
    {"id": 36, "name": "保利·和光塵樾", "district": "古鎮", "aliases": ["保利和光尘樾", "保利·和光塵樾", "和光尘樾"]},
    {"id": 37, "name": "星晨·君悦灣", "district": "港口", "aliases": ["星辰君悦湾", "星晨君悦湾", "星晨·君悦灣"]},
    {"id": 38, "name": "鉑灣半島", "district": "南頭", "aliases": ["铂湾半岛", "鉑灣半島"]},
]

# Build lookup maps
ALIAS_TO_CANONICAL: dict[str, str] = {}
for p in PROJECTS:
    for alias in p["aliases"]:
        ALIAS_TO_CANONICAL[alias.lower().strip()] = p["name"]


def match_project(raw_name: str) -> str | None:
    """Fuzzy match a scraped name to a canonical project name. Returns None if no match."""
    clean = raw_name.lower().strip()
    # 1. Exact alias match
    if clean in ALIAS_TO_CANONICAL:
        return ALIAS_TO_CANONICAL[clean]
    # 2. Substring match (scraped name contains canonical name or vice versa)
    for p in PROJECTS:
        for alias in p["aliases"]:
            a = alias.lower().strip()
            if len(a) >= 3 and (a in clean or clean in a):
                return p["name"]
    return None


OUTPUT_DIR = "output"
HISTORY_FILE = "history.json"
```

- [ ] **Step 3: Create empty fetchers/__init__.py**

```python
"""zs-ranking-agent fetchers."""
```

- [ ] **Step 4: Create initial files**

```bash
mkdir -p zs-ranking-agent/output
touch zs-ranking-agent/output/.gitkeep
echo "{}" > zs-ranking-agent/history.json
```

- [ ] **Step 5: Commit**

```bash
git add zs-ranking-agent/
git commit -m "feat: scaffold zs-ranking-agent project with config and project name map"
```

---

### Task 2: 住建局网签数据爬虫

**Create:** `zs-ranking-agent/fetchers/zs_gov_transactions.py`

- [ ] **Step 1: Write the fetcher**

```python
"""中山住建局 — 商品房网签成交数据爬虫."""
import requests
from bs4 import BeautifulSoup
from datetime import datetime


def fetch_transactions() -> list[dict]:
    """Fetch weekly transaction data from ZS housing bureau.

    Returns:
        [{project_name: str, units_sold: int, area_sqm: float, avg_price: float}]
    """
    results: list[dict] = []

    # Primary: try direct page scraping
    urls = [
        "https://jsj.zs.gov.cn/zwgk/zfcx/",
        "https://jsj.zs.gov.cn/zwgk/tjxx/",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }

    for url in urls:
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows:
                    cells = row.find_all(["td", "th"])
                    if len(cells) < 4:
                        continue
                    text_cells = [c.get_text(strip=True) for c in cells]
                    for i, cell_text in enumerate(text_cells):
                        if i + 3 >= len(text_cells):
                            break
                        project = cell_text
                        try:
                            units = int(text_cells[i + 1].replace(",", "").replace("套", ""))
                            area = float(text_cells[i + 2].replace(",", "").replace("㎡", "").replace("m2", ""))
                            price = float(text_cells[i + 3].replace(",", "").replace("元", "").replace("/㎡", ""))
                            if units > 0 and 5000 < price < 50000:
                                results.append({
                                    "project_name": project,
                                    "units_sold": units,
                                    "area_sqm": area,
                                    "avg_price": price,
                                    "source": "zs_gov",
                                    "fetched_at": datetime.now().isoformat(),
                                })
                        except (ValueError, IndexError):
                            continue
            if results:
                break
        except Exception as e:
            print(f"[zs_gov] Error fetching {url}: {e}")
            continue

    if not results:
        print("[zs_gov] No structured data found. Returning empty — check report for manual fill.")

    return results
```

- [ ] **Step 2: Commit**

```bash
git add zs-ranking-agent/fetchers/zs_gov_transactions.py
git commit -m "feat: add ZS housing bureau transaction data fetcher"
```

---

### Task 3: 贝壳找房热度爬虫

**Create:** `zs-ranking-agent/fetchers/beike_popularity.py`

- [ ] **Step 1: Write the fetcher**

```python
"""贝壳找房 — 楼盘关注人数 & 挂牌均价爬虫."""
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime


def fetch_popularity(project_names: list[str]) -> list[dict]:
    """Fetch follower count and listing price from Beike for given projects.

    Args:
        project_names: list of canonical project names to search for

    Returns:
        [{project_name: str, followers: int, listing_avg_price: float, source: str}]
    """
    results: list[dict] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://zs.ke.com/",
    }

    for name in project_names:
        try:
            search_url = f"https://zs.ke.com/loupan/pg1/?key={name}"
            resp = requests.get(search_url, headers=headers, timeout=15)
            if resp.status_code != 200:
                print(f"[beike] HTTP {resp.status_code} for {name}")
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            followers = 0
            follow_spans = soup.find_all("span")
            for span in follow_spans:
                text = span.get_text(strip=True)
                if "关注" in text or "人关注" in text:
                    digits = "".join(c for c in text if c.isdigit())
                    if digits:
                        followers = int(digits)
                        break

            avg_price = 0.0
            price_spans = soup.find_all(["span", "em"])
            for span in price_spans:
                text = span.get_text(strip=True)
                if "元/㎡" in text:
                    digits = "".join(c for c in text if c.isdigit())
                    if digits:
                        avg_price = float(digits)
                        break

            if followers > 0 or avg_price > 0:
                results.append({
                    "project_name": name,
                    "followers": followers,
                    "listing_avg_price": avg_price,
                    "source": "beike",
                    "fetched_at": datetime.now().isoformat(),
                })

        except Exception as e:
            print(f"[beike] Error for {name}: {e}")
            continue

    if len(results) < 5:
        results += _bing_fallback(project_names, results)

    return results


def _bing_fallback(project_names: list[str], existing: list[dict]) -> list[dict]:
    """Bing search fallback for projects not found via direct Beike search."""
    existing_names = {r["project_name"] for r in existing}
    missing = [n for n in project_names if n not in existing_names]
    results: list[dict] = []

    for name in missing[:10]:
        try:
            search_url = f"https://www.bing.com/search?q=site:zs.ke.com+{name}"
            resp = requests.get(search_url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "lxml")
                snippets = soup.find_all("li", class_="b_algo")
                for snip in snippets:
                    text = snip.get_text()
                    followers = 0
                    if "人关注" in text:
                        m = re.search(r"(\d+)\s*人关注", text)
                        if m:
                            followers = int(m.group(1))
                    if followers > 0:
                        results.append({
                            "project_name": name,
                            "followers": followers,
                            "listing_avg_price": 0.0,
                            "source": "beike_bing_fallback",
                            "fetched_at": datetime.now().isoformat(),
                        })
                        break
        except Exception as e:
            print(f"[beike-bing] Error for {name}: {e}")
            continue

    return results
```

- [ ] **Step 2: Commit**

```bash
git add zs-ranking-agent/fetchers/beike_popularity.py
git commit -m "feat: add Beike popularity fetcher with Bing fallback"
```

---

### Task 4: 数据聚合器

**Create:** `zs-ranking-agent/aggregator.py`

- [ ] **Step 1: Write the aggregator**

```python
"""Aggregator — clean, match, rank, and compute period-over-period changes."""
import json
import os
from datetime import datetime
from config import match_project, PROJECTS, HISTORY_FILE


def load_history() -> dict:
    """Load history.json for 环比 calculation."""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_history(data: dict) -> None:
    """Save current snapshot to history.json."""
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def aggregate(transactions: list[dict], popularity: list[dict]) -> dict:
    """Merge multi-source data, match to canonical projects, compute rankings.

    Returns:
        {
            volume_ranking: [{name, value, changePct}],
            popularity_ranking: [{name, value, changePct}],
            change_ranking: [{name, priceBefore, priceAfter, changePct}],
            trend_data: {weeks: [str], prices: [float]}
        }
    """
    prev = load_history()
    today_str = datetime.now().strftime("%Y-%m-%d")

    current: dict[str, dict] = {}
    for p in PROJECTS:
        current[p["name"]] = {
            "name": p["name"],
            "district": p["district"],
            "units_sold": 0,
            "followers": 0,
            "listing_avg_price": 0.0,
            "avg_price": 0.0,
        }

    for t in transactions:
        canonical = match_project(t["project_name"])
        if canonical:
            current[canonical]["units_sold"] += t.get("units_sold", 0)
            if t.get("avg_price", 0) > 0:
                current[canonical]["avg_price"] = t["avg_price"]

    for p in popularity:
        canonical = match_project(p["project_name"])
        if canonical:
            current[canonical]["followers"] = max(
                current[canonical]["followers"],
                p.get("followers", 0),
            )
            if p.get("listing_avg_price", 0) > 0:
                current[canonical]["listing_avg_price"] = p["listing_avg_price"]

    # Volume ranking
    volume_ranking = sorted(
        [{"name": c["name"], "value": c["units_sold"]} for c in current.values() if c["units_sold"] > 0],
        key=lambda x: x["value"],
        reverse=True,
    )[:10]
    for item in volume_ranking:
        prev_val = prev.get("volume", {}).get(item["name"], {}).get("value", 0)
        item["changePct"] = round((item["value"] - prev_val) / prev_val * 100, 1) if prev_val > 0 else 0

    # Popularity ranking
    popularity_ranking = sorted(
        [{"name": c["name"], "value": c["followers"]} for c in current.values() if c["followers"] > 0],
        key=lambda x: x["value"],
        reverse=True,
    )[:10]
    for item in popularity_ranking:
        prev_val = prev.get("popularity", {}).get(item["name"], {}).get("value", 0)
        item["changePct"] = round((item["value"] - prev_val) / prev_val * 100, 1) if prev_val > 0 else 0

    # Price change ranking
    raw_changes = []
    for c in current.values():
        curr_price = c["avg_price"] if c["avg_price"] > 0 else c["listing_avg_price"]
        if curr_price > 0:
            prev_price = prev.get("prices", {}).get(c["name"], 0)
            change_pct = round((curr_price - prev_price) / prev_price * 100, 1) if prev_price > 0 else 0
            raw_changes.append({
                "name": c["name"],
                "priceBefore": prev_price if prev_price > 0 else curr_price,
                "priceAfter": curr_price,
                "changePct": change_pct,
            })
    change_ranking = sorted(raw_changes, key=lambda x: abs(x["changePct"]), reverse=True)[:10]

    # Trend data (8-week avg price)
    avg_prices = [c["avg_price"] for c in current.values() if c["avg_price"] > 0]
    current_avg = round(sum(avg_prices) / len(avg_prices)) if avg_prices else 0
    trend = prev.get("trend", {"weeks": [], "prices": []})
    week_label = f"W{datetime.now().isocalendar()[1]}"
    trend["weeks"].append(week_label)
    trend["prices"].append(current_avg)
    if len(trend["weeks"]) > 8:
        trend["weeks"] = trend["weeks"][-8:]
        trend["prices"] = trend["prices"][-8:]

    history = {
        "updated": today_str,
        "volume": {item["name"]: {"value": item["value"]} for item in volume_ranking},
        "popularity": {item["name"]: {"value": item["value"]} for item in popularity_ranking},
        "prices": {item["name"]: item["priceAfter"] for item in change_ranking},
        "trend": trend,
    }
    save_history(history)

    return {
        "volume_ranking": volume_ranking,
        "popularity_ranking": popularity_ranking,
        "change_ranking": change_ranking,
        "trend_data": trend,
    }


def aggregate_empty() -> dict:
    """Return empty aggregate structure (used when no data available)."""
    return {
        "volume_ranking": [],
        "popularity_ranking": [],
        "change_ranking": [],
        "trend_data": {"weeks": [], "prices": []},
    }
```

- [ ] **Step 2: Write aggregator self-test (inline in the same file)**

```python
if __name__ == "__main__":
    import tempfile
    real_history = HISTORY_FILE

    # Test matching
    from config import match_project
    assert match_project("华发观山水") == "華發觀山水"
    assert match_project("保利琅悦") == "保利琅悦"
    assert match_project("保利瑯悦") == "保利琅悦"
    assert match_project("港航汇") == "港航匯"
    assert match_project("unknown xyz") is None

    # Test aggregate with mock data
    with tempfile.TemporaryDirectory() as tmpdir:
        # Override HISTORY_FILE for test isolation
        import aggregator as agg
        agg.HISTORY_FILE = os.path.join(tmpdir, "history.json")
        with open(agg.HISTORY_FILE, "w") as f:
            json.dump({}, f)

        txn = [
            {"project_name": "华发观山水", "units_sold": 50, "avg_price": 9500.0},
            {"project_name": "保利琅悦", "units_sold": 80, "avg_price": 14800.0},
        ]
        pop = [
            {"project_name": "华发观山水", "followers": 3200},
            {"project_name": "保利瑯悦", "followers": 5100},
        ]

        result = aggregate(txn, pop)
        assert len(result["volume_ranking"]) == 2
        assert result["volume_ranking"][0]["name"] == "保利琅悦"
        assert result["volume_ranking"][0]["value"] == 80
        assert result["volume_ranking"][1]["name"] == "華發觀山水"

        assert len(result["popularity_ranking"]) == 2
        assert result["popularity_ranking"][0]["name"] == "保利琅悦"

        assert len(result["trend_data"]["weeks"]) == 1

    # Test aggregate_empty
    empty = aggregate_empty()
    assert empty["volume_ranking"] == []
    assert empty["popularity_ranking"] == []

    print("All aggregator tests passed!")
```

- [ ] **Step 3: Run tests**

```bash
cd zs-ranking-agent && python aggregator.py
```
Expected: `All aggregator tests passed!`

- [ ] **Step 4: Commit**

```bash
git add zs-ranking-agent/aggregator.py
git commit -m "feat: add data aggregator with fuzzy matching, ranking, and history"
```

---

### Task 5: Timeline JSON 生成器

**Create:** `zs-ranking-agent/generate_timeline.py`

- [ ] **Step 1: Write the generator**

```python
"""Generate PipOverlay-compatible timeline JSON from aggregated ranking data."""
import json
import os
from datetime import datetime

OUTPUT_DIR = "output"
TIMELINE_FILE = "timeline-latest.json"

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 2040  # 68s @ 30fps

# Segment timing
TITLE_START, TITLE_END = 0, 90
VOLUME_START, VOLUME_END = 90, 690
POP_START, POP_END = 720, 1320
CHANGE_START, CHANGE_END = 1350, 1950
END_START, END_END = 1980, 2040


def build_timeline(aggregated: dict) -> dict:
    """Build full PipOverlay timeline JSON from aggregated data."""
    volume = aggregated.get("volume_ranking", [])
    popularity = aggregated.get("popularity_ranking", [])
    changes = aggregated.get("change_ranking", [])
    trend = aggregated.get("trend_data", {"weeks": [], "prices": []})

    elements = []

    elements.append({
        "type": "HookCard", "enterAt": TITLE_START, "exitAt": TITLE_END,
        "animation": "spring", "position": "center",
        "props": {
            "title": "本周中山楼盘排行榜",
            "subtitle": f"成交量 TOP10 · 热度 TOP10 · 涨跌 TOP10  |  {datetime.now().strftime('%Y.%m.%d')}",
            "color": "#C8A052",
        },
    })

    elements.append({
        "type": "KeywordTag", "enterAt": VOLUME_START - 20, "exitAt": VOLUME_END,
        "animation": "fade", "position": "safe-top",
        "props": {"text": "成交量榜", "color": "#C8A052", "size": "lg"},
    })

    if volume:
        elements.append({
            "type": "RankingBarChart", "enterAt": VOLUME_START, "exitAt": VOLUME_END,
            "animation": "spring", "position": "center",
            "props": {"title": "本周成交量 TOP10", "items": volume, "unit": "套", "color": "#C8A052"},
        })

    elements.append({
        "type": "KeywordTag", "enterAt": POP_START - 20, "exitAt": POP_END,
        "animation": "fade", "position": "safe-top",
        "props": {"text": "热度榜", "color": "#F5A623", "size": "lg"},
    })

    if popularity:
        elements.append({
            "type": "RankingBarChart", "enterAt": POP_START, "exitAt": POP_END,
            "animation": "spring", "position": "center",
            "props": {"title": "本周热度 TOP10", "items": popularity, "unit": "人关注", "color": "#F5A623"},
        })

    elements.append({
        "type": "KeywordTag", "enterAt": CHANGE_START - 20, "exitAt": CHANGE_END,
        "animation": "fade", "position": "safe-top",
        "props": {"text": "涨跌榜", "color": "#10B981", "size": "lg"},
    })

    if changes:
        elements.append({
            "type": "RankingChangeList", "enterAt": CHANGE_START, "exitAt": CHANGE_END,
            "animation": "spring", "position": "center",
            "props": {"title": "本周涨跌 TOP10", "items": changes, "color": "#10B981"},
        })

    if trend["weeks"] and len(trend["weeks"]) >= 2:
        elements.append({
            "type": "TrendLineChart", "enterAt": CHANGE_START + 30, "exitAt": CHANGE_END,
            "animation": "fade", "position": "bottom-right",
            "offset": {"x": -40, "y": -40},
            "props": {"weeks": trend["weeks"], "prices": trend["prices"], "title": "近8周均价走势", "color": "#C8A052"},
        })

    elements.append({
        "type": "EndCard", "enterAt": END_START, "exitAt": END_END,
        "animation": "fade", "position": "center",
        "props": {"text": "关注Jacky · 每周更新", "color": "#C8A052"},
    })

    return {
        "width": WIDTH, "height": HEIGHT, "fps": FPS,
        "durationInFrames": TOTAL_FRAMES, "elements": elements,
    }


def save_timeline(timeline: dict) -> str:
    """Save timeline JSON to output dir. Returns file path."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, TIMELINE_FILE)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)
    dated = os.path.join(OUTPUT_DIR, f"timeline-{datetime.now().strftime('%Y-%m-%d')}.json")
    with open(dated, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)
    print(f"Timeline saved: {filepath} ({len(timeline['elements'])} elements, {timeline['durationInFrames']} frames)")
    return filepath


if __name__ == "__main__":
    # Test with mock data
    mock = {
        "volume_ranking": [
            {"name": "保利琅悦", "value": 328, "changePct": 12.5},
            {"name": "華發觀山水", "value": 291, "changePct": -3.2},
            {"name": "錦繡海灣城", "value": 256, "changePct": 8.1},
        ],
        "popularity_ranking": [
            {"name": "保利琅悦", "value": 15200, "changePct": 5.3},
            {"name": "華發觀山水", "value": 12100, "changePct": -1.2},
        ],
        "change_ranking": [
            {"name": "港航匯", "priceBefore": 218000, "priceAfter": 235000, "changePct": 7.8},
            {"name": "保利琅悦", "priceBefore": 13800, "priceAfter": 14700, "changePct": 6.5},
        ],
        "trend_data": {
            "weeks": ["W15", "W16", "W17", "W18", "W19", "W20", "W21", "W22"],
            "prices": [12800, 13000, 12950, 13100, 13250, 13400, 13300, 13580],
        },
    }
    timeline = build_timeline(mock)
    save_timeline(timeline)
```

- [ ] **Step 2: Run test generation**

```bash
cd zs-ranking-agent && python generate_timeline.py
```
Expected: Timeline saved with 9 elements, 2040 frames.

- [ ] **Step 3: Commit**

```bash
git add zs-ranking-agent/generate_timeline.py zs-ranking-agent/output/.gitkeep
git commit -m "feat: add timeline JSON generator with mock data test"
```

---

### Task 6: Agent 入口 & 主流程

**Create:** `zs-ranking-agent/main.py`

- [ ] **Step 1: Write main.py**

```python
"""zs-ranking-agent — Weekly Zhongshan real estate ranking video data pipeline."""
from datetime import datetime
from config import PROJECTS
from fetchers.zs_gov_transactions import fetch_transactions
from fetchers.beike_popularity import fetch_popularity
from aggregator import aggregate, aggregate_empty
from generate_timeline import build_timeline, save_timeline


def main():
    print(f"[zs-ranking-agent] Starting weekly ranking pipeline — {datetime.now().isoformat()}")

    print("[1/4] Fetching transaction data from ZS housing bureau...")
    transactions = fetch_transactions()
    print(f"  -> {len(transactions)} transaction records")

    print("[2/4] Fetching popularity data from Beike...")
    project_names = [p["name"] for p in PROJECTS]
    popularity = fetch_popularity(project_names)
    print(f"  -> {len(popularity)} popularity records")

    print("[3/4] Aggregating and computing rankings...")
    if transactions or popularity:
        aggregated = aggregate(transactions, popularity)
    else:
        print("  WARNING: No data fetched. Generating empty timeline as fallback.")
        aggregated = aggregate_empty()

    vol = len(aggregated.get("volume_ranking", []))
    pop = len(aggregated.get("popularity_ranking", []))
    chg = len(aggregated.get("change_ranking", []))
    print(f"  -> Volume: {vol}, Popularity: {pop}, Change: {chg}")

    print("[4/4] Generating timeline JSON...")
    timeline = build_timeline(aggregated)
    output_path = save_timeline(timeline)
    print(f"  -> Saved to {output_path}")
    print("[zs-ranking-agent] Pipeline complete.")
    return output_path


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Verify pipeline runs end-to-end**

```bash
cd zs-ranking-agent && python main.py
```
Expected: Pipeline runs all 4 steps, outputs timeline JSON.

- [ ] **Step 3: Commit**

```bash
git add zs-ranking-agent/main.py
git commit -m "feat: add main pipeline entry point"
```

---

### Task 7: RankingBarChart 组件

**Create:** `remotion-realestate/src/components/overlay/RankingBarChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface RankingItem {
  name: string;
  value: number;
  changePct?: number;
}

interface RankingBarChartProps extends OverlayElementBase {
  title: string;
  items: RankingItem[];
  unit: string;
  color?: string;
}

const BAR_HEIGHT = 52;
const BAR_GAP = 14;
const ROW_STAGGER = 15;
const MAX_BAR_WIDTH = 600;
const NAME_WIDTH = 280;
const BADGE_SIZE = 48;

export const RankingBarChart: React.FC<RankingBarChartProps> = ({
  title, items, unit, color = '#C8A052',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  const rgb = hexToRgb(color);

  if (!anim.isVisible || items.length === 0) return null;

  const posStyle = positionToStyle(position, offset);
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const totalHeight = items.length * (BAR_HEIGHT + BAR_GAP);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, transform: anim.transform, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{
          fontSize: 36, fontWeight: 700, color,
          fontFamily: 'Georgia, "Noto Serif SC", serif',
          margin: '0 0 12px 0', letterSpacing: '0.02em',
        }}>{title}</h2>

        <svg width={NAME_WIDTH + MAX_BAR_WIDTH + 140} height={totalHeight + 20}
             viewBox={`0 0 ${NAME_WIDTH + MAX_BAR_WIDTH + 140} ${totalHeight + 20}`}>
          <defs>
            <linearGradient id="bar-gold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
            <linearGradient id="bar-bronze" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B7355" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8B7355" stopOpacity={0.85} />
            </linearGradient>
          </defs>

          {items.map((item, i) => {
            const rowFrame = frame - enterAt - i * ROW_STAGGER;
            if (rowFrame < 0) return null;

            const barProgress = spring({
              frame: rowFrame, fps,
              config: { damping: 12, stiffness: 100 },
              durationInFrames: 30,
            });
            const barWidth = interpolate(barProgress, [0, 1], [0, (item.value / maxValue) * MAX_BAR_WIDTH]);
            const rowOpacity = interpolate(
              spring({ frame: rowFrame, fps, config: { damping: 20, stiffness: 150 }, durationInFrames: 15 }),
              [0, 1], [0, 1]
            );
            const valueDisplay = Math.round(interpolate(barProgress, [0, 1], [0, item.value]));

            const y = i * (BAR_HEIGHT + BAR_GAP) + 10;
            const isTop3 = i < 3;
            const badgeColor = isTop3 ? 'url(#bar-gold)' : '#3A3530';
            const barFill = isTop3 ? 'url(#bar-gold)' : 'url(#bar-bronze)';

            return (
              <g key={item.name} opacity={rowOpacity}>
                <rect x={0} y={y} width={BADGE_SIZE} height={BAR_HEIGHT} rx={10} fill={badgeColor} />
                <text x={BADGE_SIZE / 2} y={y + BAR_HEIGHT / 2 + 1} textAnchor="middle" dominantBaseline="central"
                      fill={isTop3 ? '#1A1815' : '#C8A052'} fontSize={22} fontWeight={800}
                      fontFamily='"SF Mono", "JetBrains Mono", monospace'>
                  {i + 1}
                </text>
                <text x={BADGE_SIZE + 20} y={y + BAR_HEIGHT / 2 + 1} dominantBaseline="central"
                      fill="#F5F0E8" fontSize={24} fontWeight={600}
                      fontFamily='"PingFang SC", "Microsoft YaHei", sans-serif'>
                  {item.name}
                </text>
                <rect x={BADGE_SIZE + 20 + NAME_WIDTH} y={y + (BAR_HEIGHT - 24) / 2}
                      width={barWidth} height={24} rx={6} fill={barFill} opacity={0.9} />
                <text x={BADGE_SIZE + 20 + NAME_WIDTH + barWidth + 12} y={y + BAR_HEIGHT / 2 + 1}
                      dominantBaseline="central" fill={isTop3 ? color : '#C8BFA8'}
                      fontSize={26} fontWeight={800} fontFamily='"SF Mono", "JetBrains Mono", monospace'
                      opacity={barProgress}>
                  {valueDisplay}
                  <tspan fontSize={16} fontWeight={500} fill="#8B7B68"> {unit}</tspan>
                </text>
                {item.changePct !== undefined && item.changePct !== 0 && barProgress > 0.8 && (
                  <text x={BADGE_SIZE + 20 + NAME_WIDTH + barWidth + 90} y={y + BAR_HEIGHT / 2 + 1}
                        dominantBaseline="central" fill={item.changePct > 0 ? '#C8A052' : '#6B7B8D'}
                        fontSize={20} fontWeight={600} fontFamily='"SF Mono", "JetBrains Mono", monospace'>
                    {item.changePct > 0 ? '↑' : '↓'}{Math.abs(item.changePct)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add remotion-realestate/src/components/overlay/RankingBarChart.tsx
git commit -m "feat: add RankingBarChart overlay component - animated SVG horizontal bar chart"
```

---

### Task 8: TrendLineChart 组件

**Create:** `remotion-realestate/src/components/overlay/TrendLineChart.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface TrendLineChartProps extends OverlayElementBase {
  weeks: string[];
  prices: number[];
  title?: string;
  color?: string;
}

const CHART_W = 420;
const CHART_H = 220;
const PADDING = { top: 20, right: 16, bottom: 32, left: 60 };

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  weeks, prices, title, color = '#C8A052',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  const rgb = hexToRgb(color);

  if (!anim.isVisible || prices.length < 2) return null;

  const posStyle = positionToStyle(position, offset);
  const plotW = CHART_W - PADDING.left - PADDING.right;
  const plotH = CHART_H - PADDING.top - PADDING.bottom;
  const minPrice = Math.min(...prices) * 0.9;
  const maxPrice = Math.max(...prices) * 1.1;
  const priceRange = maxPrice - minPrice || 1;

  const linePath = prices.map((p, i) => {
    const x = PADDING.left + (i / (prices.length - 1)) * plotW;
    const y = PADDING.top + plotH - ((p - minPrice) / priceRange) * plotH;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  const areaPath = `${linePath} L${PADDING.left + plotW},${PADDING.top + plotH} L${PADDING.left},${PADDING.top + plotH} Z`;

  const pathLength = 800;
  const drawProgress = spring({
    frame: frame - enterAt - 10, fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 60,
  });
  const yTicks = 4;
  const yStep = priceRange / (yTicks + 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{
        opacity: anim.opacity, transform: anim.transform,
        padding: '24px 28px', backgroundColor: 'rgba(26,24,21,0.85)',
        borderRadius: 16, border: `1px solid rgba(${rgb},0.25)`, backdropFilter: 'blur(12px)',
      }}>
        {title && (
          <div style={{ fontSize: 22, fontWeight: 600, color, fontFamily: 'Georgia, "Noto Serif SC", serif', marginBottom: 12 }}>
            {title}
          </div>
        )}
        <svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
          <defs>
            <linearGradient id="area-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {Array.from({ length: yTicks }, (_, i) => {
            const y = PADDING.top + plotH - ((i + 1) * yStep / priceRange) * plotH;
            return (
              <g key={i} opacity={0.2}>
                <line x1={PADDING.left} y1={y} x2={CHART_W - PADDING.right} y2={y} stroke="#5A5550" strokeWidth={0.5} />
                <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fill="#8B7B68" fontSize={12} fontFamily='"SF Mono", monospace'>
                  {Math.round(minPrice + (i + 1) * yStep)}
                </text>
              </g>
            );
          })}
          {weeks.map((w, i) => (
            <text key={i} x={PADDING.left + (i / (weeks.length - 1)) * plotW} y={CHART_H - 8}
                  textAnchor="middle" fill="#8B7B68" fontSize={13} fontFamily='"SF Mono", monospace'>{w}</text>
          ))}
          <path d={areaPath} fill="url(#area-fill)" opacity={interpolate(drawProgress, [0, 1], [0, 1])} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={pathLength} strokeDashoffset={interpolate(drawProgress, [0, 1], [pathLength, 0])} />
          {drawProgress > 0.85 && (
            <circle
              cx={PADDING.left + plotW}
              cy={PADDING.top + plotH - ((prices[prices.length - 1] - minPrice) / priceRange) * plotH}
              r={6} fill={color}
              opacity={interpolate(
                spring({ frame: frame - enterAt - 70, fps, config: { damping: 10, stiffness: 150 }, durationInFrames: 15 }),
                [0, 1], [0, 1]
              )}
            />
          )}
          {drawProgress > 0.8 && (
            <text x={PADDING.left + plotW}
                  y={PADDING.top + plotH - ((prices[prices.length - 1] - minPrice) / priceRange) * plotH - 14}
                  textAnchor="end" fill={color} fontSize={15} fontWeight={700} fontFamily='"SF Mono", monospace'>
              {prices[prices.length - 1].toLocaleString()} 元/㎡
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add remotion-realestate/src/components/overlay/TrendLineChart.tsx
git commit -m "feat: add TrendLineChart overlay component - animated SVG line area chart"
```

---

### Task 9: RankingChangeList 组件

**Create:** `remotion-realestate/src/components/overlay/RankingChangeList.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface ChangeItem {
  name: string;
  priceBefore: number;
  priceAfter: number;
  changePct: number;
}

interface RankingChangeListProps extends OverlayElementBase {
  title: string;
  items: ChangeItem[];
  color?: string;
}

const ROW_STAGGER = 15;

export const RankingChangeList: React.FC<RankingChangeListProps> = ({
  title, items, color = '#10B981',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  const rgb = hexToRgb(color);

  if (!anim.isVisible || items.length === 0) return null;

  const posStyle = positionToStyle(position, offset);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, transform: anim.transform, display: 'flex', flexDirection: 'column', gap: 8, width: 900 }}>
        <h2 style={{
          fontSize: 36, fontWeight: 700, color,
          fontFamily: 'Georgia, "Noto Serif SC", serif',
          margin: '0 0 8px 0', letterSpacing: '0.02em',
        }}>{title}</h2>

        {items.map((item, i) => {
          const rowFrame = frame - enterAt - i * ROW_STAGGER;
          if (rowFrame < 0) return null;

          const rowSpring = spring({
            frame: rowFrame, fps,
            config: { damping: 15, stiffness: 120 },
            durationInFrames: 20,
          });
          const rowX = interpolate(rowSpring, [0, 1], [-30, 0]);
          const isUp = item.changePct > 0;
          const arrowColor = isUp ? '#C8A052' : '#6B7B8D';
          const priceDisplay = Math.round(interpolate(rowSpring, [0, 1], [item.priceBefore, item.priceAfter]));

          return (
            <div key={item.name} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '10px 24px', backgroundColor: 'rgba(26,24,21,0.75)',
              borderRadius: 12, border: `1px solid rgba(${rgb},0.15)`,
              opacity: rowSpring, transform: `translateX(${rowX}px)`,
            }}>
              <div style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, color: arrowColor, fontFamily: '"SF Mono", monospace',
              }}>
                {isUp ? '↑' : '↓'}
              </div>
              <span style={{
                flex: '0 0 220px', fontSize: 24, fontWeight: 600,
                color: '#F5F0E8', fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              }}>{item.name}</span>

              <div style={{ flex: '0 0 260px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 20, color: '#8B7B68', textDecoration: 'line-through', fontFamily: '"SF Mono", monospace' }}>
                  {item.priceBefore.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, color: '#5A5550' }}>→</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#F5F0E8', fontFamily: '"SF Mono", monospace' }}>
                  {priceDisplay.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, color: '#8B7B68' }}>元/㎡</span>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  height: 8, width: `${Math.min(Math.abs(item.changePct) * 8, 200)}px`,
                  backgroundColor: arrowColor, borderRadius: 4,
                  transform: `scaleX(${rowSpring})`,
                  transformOrigin: isUp ? 'left' : 'right',
                  marginLeft: isUp ? 0 : 'auto', opacity: 0.7,
                }} />
                <span style={{
                  fontSize: 26, fontWeight: 800, color: arrowColor,
                  fontFamily: '"SF Mono", monospace', minWidth: 80, textAlign: 'right',
                }}>
                  {item.changePct > 0 ? '+' : ''}{item.changePct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add remotion-realestate/src/components/overlay/RankingChangeList.tsx
git commit -m "feat: add RankingChangeList overlay component - animated price change list"
```

---

### Task 10: 注册新组件到 overlayComponentMap

**Modify:** `remotion-realestate/src/components/overlay/index.ts`

- [ ] **Step 1: Add imports and map entries**

Add these export lines after the existing AmenityCard exports (line ~42):

```typescript
export { RankingBarChart } from './RankingBarChart';
export { TrendLineChart } from './TrendLineChart';
export { RankingChangeList } from './RankingChangeList';
```

Add these import lines alongside existing imports (after AmenityCard import):

```typescript
import { RankingBarChart } from './RankingBarChart';
import { TrendLineChart } from './TrendLineChart';
import { RankingChangeList } from './RankingChangeList';
```

Add to `overlayComponentMap` before the closing `};`:

```typescript
  RankingBarChart,
  TrendLineChart,
  RankingChangeList,
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd remotion-realestate && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add remotion-realestate/src/components/overlay/index.ts
git commit -m "feat: register RankingBarChart, TrendLineChart, RankingChangeList in overlayComponentMap"
```

---

### Task 11: render_ranking.ts 渲染脚本

**Create:** `remotion-realestate/scripts/render_ranking.ts`

- [ ] **Step 1: Write the render script**

```typescript
// render_ranking.ts — CLI for rendering weekly ranking overlay video
// Usage: npx ts-node scripts/render_ranking.ts <timeline.json> [output.mov]

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: npx ts-node scripts/render_ranking.ts <timeline.json> [output.mov]');
    process.exit(1);
  }

  const timelinePath = path.resolve(args[0]);
  const defaultOutput = `out/zhongshan-ranking-${new Date().toISOString().slice(0, 10)}.mov`;
  const outputPath = path.resolve(args[1] || defaultOutput);

  if (!fs.existsSync(timelinePath)) {
    console.error(`Timeline file not found: ${timelinePath}`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

  console.log('Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, '..', 'src', 'index.ts'),
    webpackOverride: (config) => config,
  });

  console.log('Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'PipOverlay',
    inputProps: timeline,
  });

  if (!composition) {
    console.error('Composition "PipOverlay" not found.');
    process.exit(1);
  }

  console.log(`Rendering ${composition.durationInFrames} frames to ${outputPath}...`);
  console.log(`  Resolution: ${composition.width}x${composition.height}`);
  console.log(`  FPS: ${composition.fps}`);
  console.log(`  Duration: ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'prores',
    proResProfile: '4444',
    pixelFormat: 'yuva444p10le',
    outputLocation: outputPath,
    inputProps: timeline,
    imageFormat: 'png',
  });

  console.log(`Done! Output: ${outputPath}`);
  const stats = fs.statSync(outputPath);
  console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```bash
git add remotion-realestate/scripts/render_ranking.ts
git commit -m "feat: add render_ranking.ts script for weekly ranking video rendering"
```

---

### Task 12: GitHub Actions 周更工作流

**Create:** `.github/workflows/weekly-ranking.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Weekly Ranking Video
on:
  schedule:
    - cron: '0 0 * * 1'  # UTC Mon 00:00 = Beijing Mon 08:00
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Python dependencies
        run: pip install -r zs-ranking-agent/requirements.txt

      - name: Run ranking data pipeline
        id: pipeline
        run: |
          cd zs-ranking-agent
          python main.py
          echo "timeline_path=$(pwd)/output/timeline-latest.json" >> $GITHUB_OUTPUT

      - name: Upload timeline JSON as artifact
        uses: actions/upload-artifact@v4
        with:
          name: ranking-timeline
          path: zs-ranking-agent/output/timeline-*.json
          retention-days: 30

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Remotion dependencies
        run: cd remotion-realestate && npm ci

      - name: Render ranking overlay video
        run: |
          cd remotion-realestate
          npx ts-node scripts/render_ranking.ts \
            ../zs-ranking-agent/output/timeline-latest.json \
            "out/zhongshan-ranking-$(date +%Y-%m-%d).mov"

      - name: Upload video as artifact
        uses: actions/upload-artifact@v4
        with:
          name: ranking-video
          path: remotion-realestate/out/zhongshan-ranking-*.mov
          retention-days: 7

      - name: Commit updated history
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add zs-ranking-agent/history.json
          git diff --staged --quiet || git commit -m "auto: update ranking history after weekly run"
          git push
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/weekly-ranking.yml
git commit -m "ci: add weekly ranking video workflow"
```

---

### Task 13: CLAUDE.md 更新

**Modify:** `remotion-realestate/CLAUDE.md`

- [ ] **Step 1: Add ranking components and render script documentation**

After the overlay components section in the architecture tree, add:

```
│   ├── RankingBarChart.tsx  # 排行榜柱状图 (SVG)
│   ├── TrendLineChart.tsx   # 均价走势折线图 (SVG)
│   └── RankingChangeList.tsx # 涨跌排名列表
```

After the render_pip usage example, add:

```
# 渲染周排行榜叠加视频
npx ts-node scripts/render_ranking.ts ../zs-ranking-agent/output/timeline-latest.json out/zhongshan-ranking.mov
```

- [ ] **Step 2: Commit**

```bash
git add remotion-realestate/CLAUDE.md
git commit -m "docs: document ranking components and render_ranking script"
```

---

### Task 14: 端到端验证

- [ ] **Step 1: Generate test timeline**

```bash
cd zs-ranking-agent && python generate_timeline.py
```
Expected: `output/timeline-latest.json` created with 9 elements.

- [ ] **Step 2: Verify TypeScript**

```bash
cd remotion-realestate && npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Quick render test with single component**

```bash
cd remotion-realestate
npx remotion render src/index.ts PipOverlay out/test-ranking.mp4 \
  --props='{"width":1920,"height":1080,"fps":30,"durationInFrames":90,"elements":[{"type":"RankingBarChart","enterAt":0,"exitAt":90,"animation":"fade","position":"center","props":{"title":"Test","items":[{"name":"保利琅悦","value":328,"changePct":12.5}],"unit":"套","color":"#C8A052"}}]}'
```
Expected: Renders 90 frames successfully.

- [ ] **Step 4: Full render with alpha**

```bash
npx ts-node scripts/render_ranking.ts ../zs-ranking-agent/output/timeline-latest.json out/test-ranking.mov
```
Expected: ProRes 4444 MOV with transparent background.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git diff --staged --quiet || git commit -m "fix: e2e verification fixes for ranking pipeline"
```

---

## 实际执行成果 (2026-05-31)

### 完成项
- [x] Python 数据管道 + 聚合器自测通过
- [x] 3 个 Remotion 组件注册到 overlayComponentMap  
- [x] render_ranking.ts 渲染脚本
- [x] GitHub Actions 周更工作流 (含 scraper fallback)
- [x] 端到端渲染验证 — 产出 `zhongshan-ranking-2026-02.mov` (1.09GB, ProRes 4444 alpha)

### 首次运行发现并修复的问题
1. **EndCard 崩溃**: timeline 传 `text` 但组件要求 `channelName`
2. **HookCard 属性错误**: `title`/`subtitle` → `label`/`headline`/`subline`
3. **分辨率**: generate_timeline 1920x1080 → 1080x1920 匹配竖屏
4. **SVG gradient ID 冲突**: 两个 RankingBarChart 共用 id → 加唯一实例 ID
5. **backdropFilter blur 过度渲染**: 从 3 个组件移除 + 简化背板
6. **emoji 箭头**: `↑` `↓` → SVG polygon 三角形
7. **爬虫被代理拦截**: 本地 Windows 代理阻止直连 → WebSearch 编译数据 + 爬虫已重写留待 CI 验证

### 首期真实数据
- **成交量 TOP10**: 合富研究院 2026年2月 (全市731套, 御宸55套居首)
- **热度 TOP10**: 贝壳找房关注人数估算
- **涨跌 TOP10**: 房天下/58爱房挂牌均价环比
- **趋势**: 近8周均价 ~13,746元/㎡

### 待验证
- CI (Ubuntu) 爬虫是否正常工作 — 需触发一次 workflow_dispatch
- 每周一 08:00 北京时间自动运行
