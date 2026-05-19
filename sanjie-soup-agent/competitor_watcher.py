import requests
from bs4 import BeautifulSoup
from config import COMPETITOR_QUERIES, REQUEST_TIMEOUT, MAX_COMPETITOR_ITEMS

SEARCH_URL = "https://www.google.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_competitors() -> list[dict]:
    """搜集中山北部/东凤镇周边汤店同行的抖音内容主题。"""
    items = []
    for query in COMPETITOR_QUERIES[:4]:
        try:
            params = {
                "q": f"site:douyin.com {query}",
                "num": 5,
                "tbs": "qdr:w",
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select(".g")[:3]:
                a_el = result.select_one("a[href]")
                snippet_el = result.select_one(".VwiC3b")

                title = a_el.get_text(strip=True) if a_el else ""
                link = a_el.get("href", "") if a_el else ""
                snippet = snippet_el.get_text(strip=True)[:150] if snippet_el else ""

                if title and "douyin.com" in link:
                    items.append({
                        "title": title,
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
    return unique[:MAX_COMPETITOR_ITEMS]


def summarize_competitors(items: list[dict]) -> str:
    """将竞品数据汇总为可读的文本摘要。"""
    if not items:
        return "今日暂无抓取到周边同行新动态，建议从菜单和时令选题。"

    lines = ["【今日周边同行动态】"]
    for i, item in enumerate(items, 1):
        title = item["title"][:80]
        snippet = item.get("snippet", "")[:100]
        lines.append(f"{i}. {title}")
        if snippet:
            lines.append(f"   摘要: {snippet}")
    return "\n".join(lines)
