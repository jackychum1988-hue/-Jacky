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
                "tbs": "qdr:w",
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
