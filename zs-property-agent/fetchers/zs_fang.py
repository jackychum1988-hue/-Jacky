"""Zhongshan real estate news from Fang.com (房天下)."""
import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

FANG_URL = "https://news.fang.com/zs/newsindex/market.html"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_zs_fang() -> list[dict]:
    items = []
    try:
        resp = requests.get(FANG_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a_el in soup.select(".news-list a, .list a, .main-news a")[:MAX_ITEMS_PER_SOURCE]:
            title = a_el.get_text(strip=True)
            link = a_el.get("href", "")
            if not title or not link or len(title) < 8:
                continue
            if "fang.com" not in link:
                continue
            items.append({"title": title, "link": link, "snippet": ""})
    except Exception as e:
        print(f"[zs_fang] error: {e}", file=sys.stderr)

    return items[:MAX_ITEMS_PER_SOURCE]
