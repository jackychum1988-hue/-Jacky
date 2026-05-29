import sys
import requests
from bs4 import BeautifulSoup
from config import XIAOHONGSHU_KOLS, MAX_ITEMS_PER_SOURCE, REQUEST_TIMEOUT, Platform

SEARCH_URL = "https://www.bing.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_xiaohongshu() -> list[dict]:
    items = []
    for kol in XIAOHONGSHU_KOLS:
        try:
            params = {
                "q": f"site:xiaohongshu.com {kol['query']}",
                "count": 5,
                "tbs": "qdr:w",
            }
            resp = requests.get(SEARCH_URL, headers=HEADERS, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select("li.b_algo")[:3]:
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
                        "platform": Platform.XIAOHONGSHU.value,
                        "author": kol["name"],
                        "engagement": {},
                    })
        except requests.RequestException as e:
            print(f"[xiaohongshu] request error for '{kol['name']}': {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[xiaohongshu] error for '{kol['name']}': {e}", file=sys.stderr)
            continue

    seen = set()
    unique = []
    for item in items:
        if item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
