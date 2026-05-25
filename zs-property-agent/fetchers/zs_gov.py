import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE, filter_recent

ZS_GOV_URL = "http://jsj.zs.gov.cn/zwgk/zcwj/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_zs_gov() -> list[dict]:
    items = []
    try:
        resp = requests.get(ZS_GOV_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for row in soup.select(".list-content li, .news-list li, .list li")[:MAX_ITEMS_PER_SOURCE]:
            a_el = row.select_one("a[href]")
            date_el = row.select_one(".date, .time, span:last-child")

            title = a_el.get_text(strip=True) if a_el else ""
            link = a_el["href"] if a_el else ""
            date = date_el.get_text(strip=True) if date_el else ""

            if link and not link.startswith("http"):
                link = "http://jsj.zs.gov.cn" + link

            if title:
                items.append({"title": title, "link": link, "date": date})

    except requests.RequestException as e:
        print(f"[zs_gov] request error: {e}", file=sys.stderr)
    except Exception as e:
        print(f"[zs_gov] error: {e}", file=sys.stderr)

    return filter_recent(items)
