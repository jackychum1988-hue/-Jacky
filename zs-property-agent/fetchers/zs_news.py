import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE, filter_recent

HOUSE_NEWS_URL = "http://house.zsnews.cn/index/lists/id/1210.html"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_zs_news() -> list[dict]:
    items = []
    try:
        resp = requests.get(HOUSE_NEWS_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a_el in soup.select("a.l-list-title")[:MAX_ITEMS_PER_SOURCE]:
            title = a_el.get("title", "").strip()
            link = a_el.get("href", "")
            if not title:
                title = a_el.get_text(strip=True)

            date = ""
            li_el = a_el.find_parent("li")
            if li_el:
                date_span = li_el.select_one(".l-list-meta span")
                date = date_span.get_text(strip=True) if date_span else ""

            if title and link:
                items.append({
                    "title": title,
                    "link": link,
                    "summary": "",
                    "date": date,
                })

    except Exception as e:
        print(f"[zs_news] error: {e}", file=sys.stderr)

    return filter_recent(items)
