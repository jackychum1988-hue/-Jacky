import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE, DOUYIN_BLOGGERS

SEARCH_URL = "https://www.bing.com/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_douyin() -> list[dict]:
    items = []
    for blogger in DOUYIN_BLOGGERS:
        try:
            params = {
                "q": f"site:douyin.com {blogger['query']}",
                "count": 5,
                "tbs": "qdr:d",
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
            print(f"[douyin] request error for {blogger['name']}: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[douyin] error for {blogger['name']}: {e}", file=sys.stderr)
            continue

    return items[:MAX_ITEMS_PER_SOURCE]
