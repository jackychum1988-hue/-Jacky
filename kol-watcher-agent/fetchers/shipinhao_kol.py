import sys
import requests
from bs4 import BeautifulSoup
from config import SHIPINHAO_KOLS, MAX_ITEMS_PER_SOURCE, REQUEST_TIMEOUT, Platform

SEARCH_URL = "https://www.bing.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_shipinhao() -> list[dict]:
    """Fetch 视频号 content via Bing search. Limited coverage due to platform closed nature."""
    items = []
    for kol in SHIPINHAO_KOLS:
        try:
            # Try multiple search patterns for better coverage
            queries = [
                f"{kol['query']}",
                f"视频号 {kol['name']} 中山 房产",
            ]
            for q in queries[:2]:
                params = {
                    "q": q,
                    "count": 5,
                    "tbs": "qdr:w",
                }
                resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")

                for result in soup.select("li.b_algo")[:2]:
                    a_el = result.select_one("h2 a")
                    snippet_el = result.select_one(".b_caption p")

                    title = a_el.get_text(strip=True) if a_el else ""
                    link = a_el.get("href", "") if a_el else ""
                    snippet = snippet_el.get_text(strip=True)[:150] if snippet_el else ""

                    if title and link:
                        items.append({
                            "title": title,
                            "url": link,
                            "description": snippet,
                            "published_at": "",
                            "platform": Platform.SHIPINHAO.value,
                            "author": kol["name"],
                            "engagement": {},
                            "_note": "部分覆盖（视频号封闭性强，覆盖率有限）",
                        })
        except requests.RequestException as e:
            print(f"[shipinhao] request error for '{kol['name']}': {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[shipinhao] error for '{kol['name']}': {e}", file=sys.stderr)
            continue

    seen = set()
    unique = []
    for item in items:
        if item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
