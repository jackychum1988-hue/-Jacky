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
