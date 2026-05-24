import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

FB_SEARCH_QUERIES = [
    "中山 房产 facebook",
    "中山 買樓 facebook",
    "中山 大灣區 置業 facebook",
]
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_facebook() -> list[dict]:
    items = []
    for query in FB_SEARCH_QUERIES:
        try:
            params = {"q": query, "count": 5, "tbs": "qdr:w"}
            resp = requests.get(
                "https://www.bing.com/search",
                headers=HEADERS,
                params=params,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for result in soup.select("li.b_algo")[:3]:
                a_el = result.select_one("h2 a")
                snippet_el = result.select_one(".b_caption p")

                link = a_el.get("href", "") if a_el else ""
                title = a_el.get_text(strip=True) if a_el else ""
                snippet = snippet_el.get_text(strip=True)[:150] if snippet_el else ""

                if link and title:
                    items.append({
                        "title": title,
                        "link": link,
                        "snippet": snippet,
                    })
        except requests.RequestException as e:
            print(f"[facebook] request error for '{query}': {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[facebook] error for '{query}': {e}", file=sys.stderr)
            continue

    seen = set()
    unique = []
    for item in items:
        if item["link"] not in seen:
            seen.add(item["link"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
