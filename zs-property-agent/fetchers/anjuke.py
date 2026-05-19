import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

ANJUKE_URL = "https://zhongshan.anjuke.com/loupan/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def fetch_anjuke() -> list[dict]:
    items = []
    try:
        resp = requests.get(ANJUKE_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()

        if "验证码" in resp.text or "captcha" in resp.text.lower():
            print("[anjuke] blocked by captcha", file=sys.stderr)
            return items

        soup = BeautifulSoup(resp.text, "html.parser")

        for card in soup.select(".list-item")[:MAX_ITEMS_PER_SOURCE]:
            title_el = card.select_one(".item-title .items-name")
            price_el = card.select_one(".price")
            area_el = card.select_one(".list-map")
            tags_el = card.select(".tag-panel .tag")

            title = title_el.get_text(strip=True) if title_el else ""
            price = price_el.get_text(strip=True) if price_el else ""
            area = area_el.get_text(strip=True) if area_el else ""
            tags = [t.get_text(strip=True) for t in tags_el] if tags_el else []

            link_el = card.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = "https:" + link

            if title:
                items.append({
                    "title": title,
                    "price": price,
                    "area": area,
                    "tags": tags,
                    "link": link,
                })

    except requests.RequestException as e:
        print(f"[anjuke] request error: {e}", file=sys.stderr)
    except Exception as e:
        print(f"[anjuke] error: {e}", file=sys.stderr)

    return items
